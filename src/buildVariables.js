/* eslint-disable default-case */
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
} from "ra-core";
import {
  isObject,
  isArray,
  isDate,
  isString,
  every,
  isNumber,
  isEmpty,
} from "lodash";
import { isPlural } from "pluralize";
import getFinalType from "./getFinalType";
import isList from "./isList";

const sanitizeValue = (type, value) => {
  if (type.name === "Int") {
    return parseInt(value, 10);
  }

  if (type.name === "Float") {
    return parseFloat(value);
  }

  return value;
};

const castType = (value, type) => {
  switch (`${type.kind}:${type.name}`) {
    case "SCALAR:Int":
      return Number(value);

    case "SCALAR:String":
      return String(value);

    case "SCALAR:Boolean":
      return Boolean(value);

    default:
      return value;
  }
};

export const getInputObjectForType = (
  introspectionResults,
  type,
  queryTypeName
) => {
  const typeName = type.name;
  let argName;
  if (queryTypeName === "create") {
    argName = `${typeName}CreateInput`;
  }
  if (queryTypeName === "update") {
    argName = `${typeName}UpdateInput`;
  }
  return introspectionResults.types.find((arg) => arg.name === argName);
};

const prepareParams = (params, queryType, introspectionResults) => {
  const result = {};

  if (!params) {
    return params;
  }

  Object.keys(params).forEach((key) => {
    const param = params[key];
    let arg = null;

    if (!param) {
      result[key] = param;
      return;
    }

    if (queryType && Array.isArray(queryType.args)) {
      arg = queryType.args.find((item) => item.name === key);
    }

    if (param instanceof File) {
      result[key] = param;
      return;
    }

    if (
      param instanceof Object &&
      !Array.isArray(param) &&
      arg &&
      arg.type.kind === "INPUT_OBJECT"
    ) {
      const args = introspectionResults.types.find(
        (item) => item.kind === arg.type.kind && item.name === arg.type.name
      ).inputFields;
      result[key] = prepareParams(param, { args }, introspectionResults);
      return;
    }

    if (param instanceof Object && !Array.isArray(param)) {
      if (param.id) {
        // For federation
        const type = getFinalType(queryType.type);
        const queryTypeName = queryType.name.substring(0, 6);
        if (queryTypeName === "create" || queryTypeName === "update") {
          const inputType = getInputObjectForType(
            introspectionResults,
            type,
            queryTypeName
          );
          const inputTypeFields = inputType.inputFields.map(
            (field) => field.name
          );

          if (!inputTypeFields.includes(key)) {
            if (inputTypeFields.includes(key + "Id")) {
              result[key + "Id"] = param.id;
              return;
            }
          }
        }
      }
      result[key] = prepareParams(param, queryType, introspectionResults);
      return;
    }

    if (!arg) {
      result[key] = param;
      return;
    }

    result[key] = castType(param, arg.type);
  });

  return result;
};

const buildGetListVariables = (introspectionResults) => (
  resource,
  aorFetchType,
  params
) => {
  if (!params || !params.filter) return {};
  const filter = Object.keys(params.filter).reduce((acc, key) => {
    if (key === "ids") {
      return { ...acc, id_in: params.filter[key] };
    }

    if (typeof params.filter[key] === "object") {
      const type = introspectionResults.types.find(
        (t) => t.name === `${resource.type.name}WhereInput`
      );
      const filterSome = type.inputFields.find((t) => t.name === `${key}_some`);

      if (filterSome) {
        const filter = Object.keys(params.filter[key]).reduce(
          (filter_acc, k) => ({
            ...filter_acc,
            [`${k}_in`]: params.filter[key][k],
          }),
          {}
        );
        return { ...acc, [`${key}_some`]: filter };
      }
    }

    const parts = key.split(".");

    if (parts.length > 1) {
      if (parts[1] === "id") {
        const type = introspectionResults.types.find(
          (t) => t.name === `${resource.type.name}WhereInput`
        );
        const filterSome = type.inputFields.find(
          (t) => t.name === `${parts[0]}_some`
        );

        if (filterSome) {
          return {
            ...acc,
            [`${parts[0]}_some`]: { id: params.filter[key] },
          };
        }

        return { ...acc, [parts[0]]: { id: params.filter[key] } };
      }

      const resourceField = resource.type.fields.find(
        (f) => f.name === parts[0]
      );
      const type = getFinalType(resourceField.type);
      return { ...acc, [key]: sanitizeValue(type, params.filter[key]) };
    }

    const resourceField = resource.type.fields.find((f) => f.name === key);

    if (resourceField) {
      const type = getFinalType(resourceField.type);
      const isAList = isList(resourceField.type);

      if (isAList) {
        return {
          ...acc,
          [key]: Array.isArray(params.filter[key])
            ? params.filter[key].map((value) => sanitizeValue(type, value))
            : sanitizeValue(type, [params.filter[key]]),
        };
      }

      return { ...acc, [key]: sanitizeValue(type, params.filter[key]) };
    }

    return { ...acc, [key]: params.filter[key] };
  }, {});

  return {
    skip: parseInt((params.pagination.page - 1) * params.pagination.perPage),
    first: parseInt(params.pagination.perPage),
    orderBy: `${params.sort.field}_${params.sort.order}`,
    where: filter,
  };
};

const buildCreateVariables = (resource, aorFetchType, params) => {
  const variables = Object.keys(params.data).reduce((acc, key) => {
    if (["id", "createdAt", "updatedAt"].includes(key) || key.endsWith("Ids")) {
      return acc;
    }

    const value = params.data[key];
    if (isDate(value)) {
      return {
        ...acc,
        [key]: value.toISOString(),
      };
    } else if (isArray(value)) {
      if (every(value, isString) || every(value, isNumber)) {
        return {
          ...acc,
          [key]: { set: value },
        };
      }
      // to-many (Type)
      const connect = [];
      const create = [];
      value.forEach((v) => {
        if (v && isString(v.id)) {
          connect.push({ id: v.id });
        } else {
          create.push(v);
        }
      });

      const param = {};
      // TODO: handle link to Type and "Update Delete Create" at the same time
      if (aorFetchType === "UPDATE" && params.previousData[key].length > 0) {
        // update if exists have value
        const previousValue = params.previousData[key];
        if (create.length > previousValue.length) {
          param.create = create.slice(previousValue.length);
        } else if (create.length < previousValue.length) {
          param.deleteMany = previousValue.slice(create.length);
        } else {
          param.updateMany = previousValue.map((pv, i) => ({
            where: pv,
            data: create[i],
          }));
        }
      } else {
        // CREATE or no array data before when UPDATE
        if (connect.length > 0) {
          param.connect = connect;
        }
        if (create.length > 0) {
          param.create = create;
        }
      }

      return {
        ...acc,
        [key]: { ...param },
      };
    } else if (isObject(value)) {
      // to-one (Type)
      if (isString(value.id)) {
        return {
          ...acc,
          [key]: { connect: { id: value.id } },
        };
      } else {
        return {
          ...acc,
          [key]: { create: value },
        };
      }
    }

    // Never return nested types as variables for now
    const parts = key.split(".");
    if (parts.length > 1) {
      // params.data[key].map(item => {
      //   console.log(key, item)
      // })
      return acc;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {});
  console.log("params/var", params, variables);
  return variables;
};

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
const difference = (object, base) => {
  function changes(object, base) {
    return _.transform(object, function (result, value, key) {
      if (!_.isEqual(value, base[key])) {
        if (_.isObject(value) && _.isObject(base[key])) {
          result[key] = changes(value, base[key]);
        } else {
          result[key] = value;
          // Storing the id to know the operation is update or create.
          if (!result.id && base.id) {
            result.id = base.id;
          }
        }

        if (isArray(value) && isArray(base[key])) {
          // For object item that doesn't contain the id is the record that will be created and it should be filtered here.
          const existedValue = value.filter((v) => v.id);
          // Get the removed value from base data in order to delete.
          const diffArray = _.differenceBy(base[key], existedValue, "id");
          if (diffArray.length > 0) {
            result[key] = result[key].concat(diffArray);
          }
        }
      }
    });
  }

  return changes(object, base);
};

const buildUpdateVariables = (
  resource,
  aorFetchType,
  { data, previousData }
) => {
  const differences = difference(data, previousData);
  // Filter the undefined value in differences
  for (const key in differences) {
    if (isArray(differences[key])) {
      differences[key] = differences[key].filter(
        (value) =>
          (!isObject(value) && value) || (isObject(value) && !isEmpty(value))
      );
    }
  }
  // console.log('params/var diff', data, previousData, differences);
  const variables = Object.keys(differences).reduce((acc, key) => {
    if (["id", "createdAt", "updatedAt"].includes(key)) {
      return acc;
    }

    // const value = data[key];
    const value = differences[key];
    if (isDate(value)) {
      return {
        ...acc,
        [key]: value.toISOString(),
      };
    } else if (key.endsWith("Ids")) {
      return {
        ...acc,
        [key.substr(0, key.length - 3)]: {
          connect: value.map((id) => ({ id })),
        },
      };
    } else if (isArray(value)) {
      if (every(value, isString) || every(value, isNumber)) {
        return {
          ...acc,
          [key]: { set: value },
        };
      }
      // to-many (Type)
      const connect = [];
      const create = [];
      const update = [];
      const remove = [];
      // const diffValue = differences[key];
      value.forEach((v, index) => {
        console.log("v", v);
        // When there is only an id in the value then we see it as id of connect.
        if (v && isString(v.id)) {
          if (Object.keys(v).length === 1) {
            connect.push({ id: v.id });
          } else {
            const { id, ...other } = v;
            // If cannot find the id in current data then the operation will be delete.
            if (data[key].find((dataValue) => dataValue.id === id)) {
              update.push({ data: other, where: { id } });
            } else {
              remove.push({ id });
            }
          }
        } else {
          create.push(v);
        }
      });
      const diffValue = differences[key];
      diffValue;

      // console.log('connect', connect);
      // console.log('create', create);
      // console.log('update', update);
      // console.log('remove', remove);
      const param = {};
      // TODO: handle link to Type and "Update Delete Create" at the same time
      if (create.length > 0) {
        param.create = create;
      }
      if (create.length > 0) {
        param.connect = connect;
      }
      if (update.length > 0) {
        param.update = update;
      }
      if (remove.length > 0) {
        param.delete = remove;
      }

      return {
        ...acc,
        [key]: { ...param },
      };
    } else if (isObject(value)) {
      let connect;
      let update;
      // to-one (Type)
      if (isString(value.id)) {
        if (Object.keys(value).length === 1) {
          connect = { id: value.id };
        } else {
          const { id, ...other } = value;
          // If cannot find the id in current data then the operation will be delete.
          if (data[key].id === id) {
            update = { ...other };
          }
        }
        const param = {};
        if (connect) {
          param.connect = connect;
        }
        if (update) {
          param.update = update;
        }
        return {
          ...acc,
          [key]: { ...param },
        };
      } else {
        return {
          ...acc,
          [key]: { create: value },
        };
      }
    }

    // Never return nested types as variables for now
    const parts = key.split(".");
    if (parts.length > 1) {
      // params.data[key].map(item => {
      //   console.log(key, item)
      // })
      return acc;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {});
  return variables;
};

export default (introspectionResults) => (
  resource,
  aorFetchType,
  params,
  queryType
) => {
  // console.log('buildVariables introspectionResults', resource, aorFetchType, params, queryType);
  const preparedParams = prepareParams(params, queryType, introspectionResults);

  switch (aorFetchType) {
    case GET_LIST: {
      return buildGetListVariables(introspectionResults)(
        resource,
        aorFetchType,
        preparedParams,
        queryType
      );
    }
    case GET_MANY:
      return {
        where: {
          id_in:
            preparedParams.ids.length > 0 && isObject(preparedParams.ids[0])
              ? preparedParams.ids.map((v) => v.id)
              : preparedParams.ids,
        },
      };
    case GET_MANY_REFERENCE: {
      const parts = preparedParams.target.split(".");
      const where = isPlural(parts[0])
        ? { [`${parts[0]}_some`]: { id: params.id } }
        : { [parts[0]]: { id: params.id } };
      return {
        skip: parseInt(
          (params.pagination.page - 1) * params.pagination.perPage
        ),
        first: parseInt(params.pagination.perPage),
        orderBy: `${params.sort.field}_${params.sort.order}`,
        where,
      };
    }
    case GET_ONE:
    case DELETE:
      return {
        where: {
          id: preparedParams.id,
        },
      };
    case CREATE: {
      return {
        data: buildCreateVariables(
          resource,
          aorFetchType,
          preparedParams,
          queryType
        ),
      };
    }
    case UPDATE: {
      return {
        data: buildUpdateVariables(
          resource,
          aorFetchType,
          preparedParams,
          queryType
        ),
        where: {
          id: preparedParams.id,
        },
      };
    }
  }
};
