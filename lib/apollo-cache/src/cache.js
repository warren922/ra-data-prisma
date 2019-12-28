var graphql_1 = require('graphql');
var apollo_utilities_1 = require('apollo-utilities');
var types_1 = require('./types');
var utils_1 = require('./utils');
abstract;
var ApolloCache = (function () {
    function ApolloCache() {
        // required to implement
        // core API
        this.abstract = read(query, types_1.Cache.ReadOptions < TVariables > );
        this.T =  | null;
        this.abstract = write(write, types_1.Cache.WriteOptions < TResult, TVariables > );
        this.abstract = diff(query, types_1.Cache.DiffOptions);
        this.abstract = watch(watch, types_1.Cache.WatchOptions);
    }
    return ApolloCache;
})();
(function () { return void ; });
abstract;
evict(query, types_1.Cache.EvictOptions < TVariables > );
types_1.Cache.EvictionResult;
abstract;
reset();
Promise();
abstract;
restore(serializedState, TSerialized);
ApolloCache();
abstract;
extract(optimistic ?  : boolean);
TSerialized;
abstract;
removeOptimistic(id, string);
void ;
abstract;
performTransaction(transaction, Transaction < TSerialized > );
void ;
abstract;
recordOptimisticTransaction(transaction, Transaction < TSerialized > , id, string);
void ;
transformDocument(document, graphql_1.DocumentNode);
graphql_1.DocumentNode;
{
    return document;
}
transformForLink(document, graphql_1.DocumentNode);
graphql_1.DocumentNode;
{
    return document;
}
readQuery(options, types_1.DataProxy.Query < TVariables > , optimistic, boolean = false);
QueryType | null;
{
    return this.read({
        query: options.query,
        variables: options.variables,
        optimistic: optimistic,
    });
}
readFragment(options, types_1.DataProxy.Fragment < TVariables > , optimistic, boolean = false);
FragmentType | null;
{
    return this.read({
        query: apollo_utilities_1.getFragmentQueryDocument(options.fragment, options.fragmentName),
        variables: options.variables,
        rootId: options.id,
        optimistic: optimistic,
    });
}
writeQuery(options, types_1.Cache.WriteQueryOptions < TData, TVariables > );
void {
    this: .write({
        dataId: 'ROOT_QUERY',
        result: options.data,
        query: options.query,
        variables: options.variables,
    })
};
writeFragment(options, types_1.Cache.WriteFragmentOptions < TData, TVariables > );
void {
    this: .write({
        dataId: options.id,
        result: options.data,
        variables: options.variables,
        query: apollo_utilities_1.getFragmentQueryDocument(options.fragment, options.fragmentName),
    })
};
writeData({
    id: id,
    data: data,
}, types_1.Cache.WriteDataOptions(), void {
    if: function () { }, typeof: id !== 'undefined' });
{
    var typenameResult = null;
    // Since we can't use fragments without having a typename in the store,
    // we need to make sure we have one.
    // To avoid overwriting an existing typename, we need to read it out first
    // and generate a fake one if none exists.
    try {
        typenameResult = this.read({
            rootId: id,
            optimistic: false,
            query: utils_1.justTypenameQuery,
        });
    }
    catch (e) {
    }
    // tslint:disable-next-line
    var __typename = (typenameResult && typenameResult.__typename) || '__ClientData';
    // Add a type here to satisfy the inmemory cache
    var dataToWrite = Object.assign({ __typename: __typename }, data);
    this.writeFragment({
        id: id,
        fragment: utils_1.fragmentFromPojo(dataToWrite, __typename),
        data: dataToWrite,
    });
}
{
    this.writeQuery({ query: utils_1.queryFromPojo(data), data: data });
}
