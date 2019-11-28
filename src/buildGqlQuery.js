import { CREATE, UPDATE, GET_ONE, GET_LIST, GET_MANY, GET_MANY_REFERENCE, DELETE } from 'ra-core';
import { QUERY_TYPES } from 'ra-data-graphql';
import { TypeKind } from 'graphql';
import * as gqlTypes from 'graphql-ast-types-browser';

import getFinalType from './getFinalType';
import isList from './isList';
import isRequired from './isRequired';

export const buildFields = (introspectionResults, path = []) => fields =>
  fields.reduce((acc, field) => {
    const type = getFinalType(field.type);

    if (type.name.startsWith('_')) {
      return acc;
    }

    if (type.kind !== TypeKind.OBJECT && type.kind !== TypeKind.INTERFACE) {
      return [...acc, gqlTypes.field(gqlTypes.name(field.name))];
    }

    const linkedResource = introspectionResults.resources.find(
      r => r.type.name === type.name
    );

    if (linkedResource) {
      return [
        ...acc,
        gqlTypes.field(
          gqlTypes.name(field.name),
          null,
          null,
          null,
          gqlTypes.selectionSet([gqlTypes.field(gqlTypes.name('id'))])
        ),
      ];
    }

    const linkedType = introspectionResults.types.find(
      t => t.name === type.name
    );

    if (linkedType && !path.includes(linkedType.name)) {
      path.push(linkedType.name);

      return [
        ...acc,
        gqlTypes.field(
          gqlTypes.name(field.name),
          null,
          null,
          null,
          gqlTypes.selectionSet(
            buildFields(introspectionResults, path)(
              linkedType.fields
            )
          )
        ),
      ];
    }

    // NOTE: We might have to handle linked types which are not resources but will have to be careful about
    // ending with endless circular dependencies
    return acc;
  }, []);

export const getArgType = arg => {
  const type = getFinalType(arg.type);
  const required = isRequired(arg.type);
  const list = isList(arg.type);

  if (list) {
    if (required) {
      return gqlTypes.listType(
        gqlTypes.nonNullType(
          gqlTypes.namedType(gqlTypes.name(type.name))
        )
      );
    }
    return gqlTypes.listType(gqlTypes.namedType(gqlTypes.name(type.name)));
  }

  if (required) {
    return gqlTypes.nonNullType(gqlTypes.namedType(gqlTypes.name(type.name)));
  }

  return gqlTypes.namedType(gqlTypes.name(type.name));
};

export const buildArgs = (query, variables, inputType) => {
  if (query.args.length === 0) {
    return [];
  }

  const validVariables = Object.keys(variables).filter(
    k => typeof variables[k] !== 'undefined'
  );
  let args;
  if (inputType) {
    args = inputType.inputFields
      .filter(a => validVariables.includes(a.name))
      .reduce(
        (acc, arg) => [
          ...acc,
          gqlTypes.argument(
            gqlTypes.name(arg.name),
            gqlTypes.variable(gqlTypes.name(arg.name))
          ),
        ],
        []
      );
  } else {
    args = query.args
      .filter(a => validVariables.includes(a.name))
      .reduce(
        (acc, arg) => [
          ...acc,
          gqlTypes.argument(
            gqlTypes.name(arg.name),
            gqlTypes.variable(gqlTypes.name(arg.name))
          ),
        ],
        []
      );
  }

  return args;
};

export const buildApolloArgs = (query, variables, inputType) => {
  if (query.args.length === 0) {
    return [];
  }

  const validVariables = Object.keys(variables).filter(
    k => typeof variables[k] !== 'undefined'
  );

  console.log('Apollo ARgs', query, variables, validVariables)

  let args;
  if (inputType) {
    args = inputType.inputFields
      .filter(a => validVariables.includes(a.name))
      .reduce((acc, arg) => {
        return [
          ...acc,
          gqlTypes.variableDefinition(
            gqlTypes.variable(gqlTypes.name(arg.name)),
            getArgType(arg)
          ),
        ];
      }, []);
  } else {
    args = query.args
      .filter(a => validVariables.includes(a.name))
      .reduce((acc, arg) => {
        return [
          ...acc,
          gqlTypes.variableDefinition(
            gqlTypes.variable(gqlTypes.name(arg.name)),
            getArgType(arg)
          ),
        ];
      }, []);
  }

  return args;
};
export const getInputObjectForType = (
  introspectionResults,
  type,
  aorFetchType
) => {
  const typeName = type.name;
  let argName;
  if (aorFetchType === CREATE) {
    argName = `${typeName}CreateInput`;
  }
  if (aorFetchType === UPDATE) {
    argName = `${typeName}UpdateInput`;
  }
  return introspectionResults.types.find(arg => arg.name === argName);
};

export default introspectionResults => (
  resource,
  aorFetchType,
  queryType,
  variables
) => {
  const inputType = getInputObjectForType(
    introspectionResults,
    resource.type,
    aorFetchType
  );
  const { sortField, sortOrder, ...metaVariables } = variables;
  const apolloArgs = buildApolloArgs(queryType, variables, inputType);
  const args = buildArgs(queryType, variables, inputType);
  const metaArgs = buildArgs(queryType, metaVariables);
  const fields = buildFields(introspectionResults)(resource.type.fields);
  console.log('variables', apolloArgs, args, metaArgs, fields, resource)
  if (
    aorFetchType === GET_LIST ||
    aorFetchType === GET_MANY ||
    aorFetchType === GET_MANY_REFERENCE
  ) {
    return gqlTypes.document([
      gqlTypes.operationDefinition(
        'query',
        gqlTypes.selectionSet([
          gqlTypes.field(
            gqlTypes.name(queryType.name),
            gqlTypes.name('items'),
            args,
            null,
            gqlTypes.selectionSet(fields)
          ),
          gqlTypes.field(
            gqlTypes.name(`${queryType.name}Connection`),
            gqlTypes.name('total'),
            metaArgs,
            null,
            gqlTypes.selectionSet([
              gqlTypes.field(
                gqlTypes.name('aggregate'),
                null,
                null,
                null,
                gqlTypes.selectionSet([gqlTypes.field(gqlTypes.name('count'))])
              ),
            ])
          ),
        ]),
        gqlTypes.name(queryType.name),
        apolloArgs
      ),
    ]);
  }

  if (aorFetchType === DELETE) {
    return gqlTypes.document([
      gqlTypes.operationDefinition(
        'mutation',
        gqlTypes.selectionSet([
          gqlTypes.field(
            gqlTypes.name(queryType.name),
            gqlTypes.name('data'),
            args,
            null,
            gqlTypes.selectionSet([
              gqlTypes.field(gqlTypes.name('id')),
            ])
          ),
        ]),
        gqlTypes.name(queryType.name),
        apolloArgs
      ),
    ]);
  }

  if (aorFetchType === GET_ONE) {
    return gqlTypes.document([
      gqlTypes.operationDefinition(
        'query',
        gqlTypes.selectionSet([
          gqlTypes.field(
            gqlTypes.name(queryType.name),
            gqlTypes.name('data'),
            args,
            null,
            gqlTypes.selectionSet(fields)
          ),
        ]),
        gqlTypes.name(queryType.name),
        apolloArgs
      ),
    ]);
  }

  if (aorFetchType === UPDATE) {
    return gqlTypes.document([
      gqlTypes.operationDefinition(
        'mutation',
        gqlTypes.selectionSet([
          gqlTypes.field(
            gqlTypes.name(queryType.name),
            gqlTypes.name('data'),
            [
              gqlTypes.argument(
                gqlTypes.name('data'),
                gqlTypes.variable(gqlTypes.name('data'))
              ),
              gqlTypes.argument(
                gqlTypes.name('where'),
                gqlTypes.variable(gqlTypes.name('where'))
              )
            ],
            null,
            gqlTypes.selectionSet(fields)
          ),
        ]),
        gqlTypes.name(queryType.name),
        [
          gqlTypes.variableDefinition(
            gqlTypes.variable(gqlTypes.name('data')),
            gqlTypes.nonNullType(gqlTypes.namedType(gqlTypes.name(`${resource.type.name}UpdateInput`)))
          ),
          gqlTypes.variableDefinition(
            gqlTypes.variable(gqlTypes.name('where')),
            gqlTypes.nonNullType(gqlTypes.namedType(gqlTypes.name(`${resource.type.name}WhereUniqueInput`)))
          ),
        ]
      ),
    ]);
  }

  if (aorFetchType === CREATE) {
    return gqlTypes.document([
      gqlTypes.operationDefinition(
        'mutation',
        gqlTypes.selectionSet([
          gqlTypes.field(
            gqlTypes.name(queryType.name),
            gqlTypes.name('data'),
            [
              gqlTypes.argument(
                gqlTypes.name('data'),
                gqlTypes.variable(gqlTypes.name('data'))
              )
            ],
            null,
            gqlTypes.selectionSet(fields)
          ),
        ]),
        gqlTypes.name(queryType.name),
        [gqlTypes.variableDefinition(
          gqlTypes.variable(gqlTypes.name('data')),
          gqlTypes.nonNullType(gqlTypes.namedType(gqlTypes.name(`${resource.type.name}CreateInput`)))
        )]
      ),
    ]);
  }

  return gqlTypes.document([
    gqlTypes.operationDefinition(
      QUERY_TYPES.includes(aorFetchType) ? 'query' : 'mutation',
      gqlTypes.selectionSet([
        gqlTypes.field(
          gqlTypes.name(queryType.name),
          gqlTypes.name('data'),
          args,
          null,
          gqlTypes.selectionSet(fields)
        ),
      ]),
      gqlTypes.name(queryType.name),
      apolloArgs
    ),
  ]);
};
