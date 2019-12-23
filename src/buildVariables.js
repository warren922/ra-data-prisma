/* eslint-disable default-case */
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
} from 'ra-core';
import { isObject, isArray, isString } from 'lodash';
import { isPlural } from 'pluralize';
import getFinalType from './getFinalType';
import isList from './isList';

const sanitizeValue = (type, value) => {
  if (type.name === 'Int') {
    return parseInt(value, 10);
  }

  if (type.name === 'Float') {
    return parseFloat(value);
  }

  return value;
};

const castType = (value, type) => {
  switch (`${type.kind}:${type.name}`) {
    case 'SCALAR:Int':
      return Number(value);

    case 'SCALAR:String':
      return String(value);

    case 'SCALAR:Boolean':
      return Boolean(value);

    default:
      return value;
  }
};

const prepareParams = (params, queryType, introspectionResults) => {
  const result = {};

  if (!params) {
    return params;
  }

  Object.keys(params).forEach(key => {
    const param = params[key];
    let arg = null;

    if (!param) {
      result[key] = param;
      return;
    }

    if (queryType && Array.isArray(queryType.args)) {
      arg = queryType.args.find(item => item.name === key);
    }

    if (param instanceof File) {
      result[key] = param;
      return;
    }

    if (
      param instanceof Object &&
      !Array.isArray(param) &&
      arg &&
      arg.type.kind === 'INPUT_OBJECT'
    ) {
      const args = introspectionResults.types.find(
        item =>
          item.kind === arg.type.kind && item.name === arg.type.name,
      ).inputFields;
      result[key] = prepareParams(param, { args }, introspectionResults);
      return;
    }

    if (param instanceof Object && !Array.isArray(param)) {
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

const buildGetListVariables = introspectionResults => (
  resource,
  aorFetchType,
  params,
) => {
  const filter = Object.keys(params.filter).reduce((acc, key) => {
    if (key === 'ids') {
      return { ...acc, id_in: params.filter[key] };
    }

    if (typeof params.filter[key] === 'object') {
      const type = introspectionResults.types.find(
        t => t.name === `${resource.type.name}WhereInput`,
      );
      const filterSome = type.inputFields.find(t => t.name === `${key}_some`);

      if (filterSome) {
        const filter = Object.keys(params.filter[key]).reduce(
          (filter_acc, k) => ({
            ...filter_acc,
            [`${k}_in`]: params.filter[key][k],
          }),
          {},
        );
        return { ...acc, [`${key}_some`]: filter };
      }
    }

    const parts = key.split('.');

    if (parts.length > 1) {
      if (parts[1] === 'id') {
        const type = introspectionResults.types.find(
          t => t.name === `${resource.type.name}WhereInput`,
        );
        const filterSome = type.inputFields.find(
          t => t.name === `${parts[0]}_some`,
        );

        if (filterSome) {
          return {
            ...acc,
            [`${parts[0]}_some`]: { id: params.filter[key] },
          };
        }

        return { ...acc, [parts[0]]: { id: params.filter[key] } };
      }

      const resourceField = resource.type.fields.find(f => f.name === parts[0]);
      const type = getFinalType(resourceField.type);
      return { ...acc, [key]: sanitizeValue(type, params.filter[key]) };
    }

    const resourceField = resource.type.fields.find(f => f.name === key);

    if (resourceField) {
      const type = getFinalType(resourceField.type);
      const isAList = isList(resourceField.type);

      if (isAList) {
        return {
          ...acc,
          [key]: Array.isArray(params.filter[key])
            ? params.filter[key].map(value =>
              sanitizeValue(type, value),
            )
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

const buildCreateUpdateVariables = (
  resource,
  aorFetchType,
  params,
) =>
  Object.keys(params.data).reduce((acc, key) => {
    if (['id', 'createdAt', 'updatedAt'].includes(key) || key.endsWith('Ids')) {
      return acc;
    }


    const value = params.data[key];
    console.log('value', value);
    if (isArray(value)) {
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
      if (aorFetchType === 'UPDATE' && params.previousData[key].length > 0) {
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
    const parts = key.split('.');
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

export default introspectionResults => (
  resource,
  aorFetchType,
  params,
  queryType,
) => {
  console.log('buildVariables introspectionResults', resource, aorFetchType, params, queryType);
  const preparedParams = prepareParams(
    params,
    queryType,
    introspectionResults,
  );

  switch (aorFetchType) {
    case GET_LIST: {
      return buildGetListVariables(introspectionResults)(
        resource,
        aorFetchType,
        preparedParams,
        queryType,
      );
    }
    case GET_MANY:
      return {
        where: { id_in: preparedParams.ids },
      };
    case GET_MANY_REFERENCE: {
      const parts = preparedParams.target.split('.');
      const where = isPlural(parts[0]) ? { [`${parts[0]}_some`]: { id: params.id } } : { [parts[0]]: { id: params.id } };
      return {
        skip: parseInt((params.pagination.page - 1) * params.pagination.perPage),
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
        data: buildCreateUpdateVariables(
          resource,
          aorFetchType,
          preparedParams,
          queryType,
        ),
      };
    }
    case UPDATE: {
      return {
        data: buildCreateUpdateVariables(
          resource,
          aorFetchType,
          preparedParams,
          queryType,
        ),
        where: {
          id: preparedParams.id,
        },
      };
    }
  }
};
