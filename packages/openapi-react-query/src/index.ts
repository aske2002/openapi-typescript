import {
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type QueryClient,
  type QueryFunctionContext,
  type SkipToken,
  useMutation,
  useQuery,
  useSuspenseQuery,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import type { ClientMethod, FetchResponse, MaybeOptionalInit, Client as FetchClient, ParamsOption } from "openapi-fetch";
import type { FilterKeys, HttpMethod, MediaType, PathsWithMethod, RequiredKeysOf } from "openapi-typescript-helpers";

type InitWithUnknowns<Init> = Init & { [key: string]: unknown };

export type QueryKey<
  Paths extends Record<string, Record<HttpMethod, {}>>,
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  PageKeyAccessor = PathKeyOfWithMethod<Paths, Method, Path> | undefined,
> = PageKeyAccessor extends undefined ? [Method, Path, MaybeOptionalInit<Paths[Path], Method>] : [Method, Path, MaybeOptionalInit<Paths[Path], Method>, PageKeyAccessor];

export type QueryOptionsFunction<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>, // note: Required is used to avoid repeating NonNullable in UseQuery types
  Options extends Omit<
    UseQueryOptions<Response["data"], Response["error"], Response["data"], QueryKey<Paths, Method, Path>>,
    "queryKey" | "queryFn"
  >,
>(
  method: Method,
  path: Path,
  ...[init, options]: RequiredKeysOf<Init> extends never
    ? [InitWithUnknowns<Init>?, Options?]
    : [InitWithUnknowns<Init>, Options?]
) => NoInfer<
  Omit<
    UseQueryOptions<Response["data"], Response["error"], Response["data"], QueryKey<Paths, Method, Path>>,
    "queryFn"
  > & {
    queryFn: Exclude<
      UseQueryOptions<Response["data"], Response["error"], Response["data"], QueryKey<Paths, Method, Path>>["queryFn"],
      SkipToken | undefined
    >;
  }
>;

export type UseQueryMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>, // note: Required is used to avoid repeating NonNullable in UseQuery types
  Options extends Omit<
    UseQueryOptions<Response["data"], Response["error"], Response["data"], QueryKey<Paths, Method, Path>>,
    "queryKey" | "queryFn"
  >,
>(
  method: Method,
  url: Path,
  ...[init, options, queryClient]: RequiredKeysOf<Init> extends never
    ? [InitWithUnknowns<Init>?, Options?, QueryClient?]
    : [InitWithUnknowns<Init>, Options?, QueryClient?]
) => UseQueryResult<Response["data"], Response["error"]>;

export type UseSuspenseQueryMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>, // note: Required is used to avoid repeating NonNullable in UseQuery types
  Options extends Omit<
    UseSuspenseQueryOptions<Response["data"], Response["error"], Response["data"], QueryKey<Paths, Method, Path>>,
    "queryKey" | "queryFn"
  >,
>(
  method: Method,
  url: Path,
  ...[init, options, queryClient]: RequiredKeysOf<Init> extends never
    ? [InitWithUnknowns<Init>?, Options?, QueryClient?]
    : [InitWithUnknowns<Init>, Options?, QueryClient?]
) => UseSuspenseQueryResult<Response["data"], Response["error"]>;

export type UseInfiniteQueryMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>,
>(
  method: Method,
  url: Path,
  ...[init, options, queryClient]: RequiredKeysOf<Init> extends never
    ? [
        InitWithUnknowns<Init>?,
        (Omit<
          UseInfiniteQueryOptions<
            Response["data"],
            Response["error"],
            Response["data"],
            number,
            QueryKey<Paths, Method, Path>
          >,
          "queryKey" | "queryFn"
        > & { pageAccessor?: PathKeyOfWithMethod<Paths, Method, Path> })?,
        QueryClient?,
      ]
    : [
        InitWithUnknowns<Init>,
        (Omit<
          UseInfiniteQueryOptions<
            Response["data"],
            Response["error"],
            Response["data"],
            number,
            QueryKey<Paths, Method, Path>
          >,
          "queryKey" | "queryFn"
        > & { pageAccessor?: PathKeyOfWithMethod<Paths, Method, Path>  })?,
        QueryClient?,
      ]
) => UseInfiniteQueryResult<InfiniteData<Response["data"]>, Response["error"]>;

export type UseMutationMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Media extends MediaType> = <
  Method extends HttpMethod,
  Path extends PathsWithMethod<Paths, Method>,
  Init extends MaybeOptionalInit<Paths[Path], Method>,
  Response extends Required<FetchResponse<Paths[Path][Method], Init, Media>>, // note: Required is used to avoid repeating NonNullable in UseQuery types
  Options extends Omit<UseMutationOptions<Response["data"], Response["error"], Init>, "mutationKey" | "mutationFn">,
>(
  method: Method,
  url: Path,
  options?: Options,
  queryClient?: QueryClient,
) => UseMutationResult<Response["data"], Response["error"], Init>;

export interface OpenapiQueryClient<Paths extends {}, Media extends MediaType = MediaType> {
  queryOptions: QueryOptionsFunction<Paths, Media>;
  useQuery: UseQueryMethod<Paths, Media>;
  useSuspenseQuery: UseSuspenseQueryMethod<Paths, Media>;
  useInfiniteQuery: UseInfiniteQueryMethod<Paths, Media>;
  useMutation: UseMutationMethod<Paths, Media>;
}

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`

type PathKeyOf<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<PathKeyOf<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;

type PathKeyOfWithMethod<Paths extends Record<string, Record<HttpMethod, {}>>, Method extends HttpMethod, Path extends PathsWithMethod<Paths, Method>> = PathKeyOf<ParamsOption<FilterKeys<Paths[Path], Method>>>;

function setNestedValue<T extends Record<string, any>>(obj: T, path: string, value: any): void {
  const keys = path.split('.'); // Split the dot notation into keys
  let current: any = obj;

  // Traverse the object to the second-to-last key
  for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
          // If the key doesn't exist or is not an object, create an empty object
          current[key] = {};
      }
      current = current[key];
  }

  // Set the value for the final key
  current[keys[keys.length - 1]] = value;
}

// TODO: Add the ability to bring queryClient as argument
export default function createClient<Paths extends {}, Media extends MediaType = MediaType>(
  client: FetchClient<Paths, Media>,
): OpenapiQueryClient<Paths, Media> {
  const queryFn = async <Method extends HttpMethod, Path extends PathsWithMethod<Paths, Method>>({
    queryKey: [method, path, init],
    signal,
  }: QueryFunctionContext<QueryKey<Paths, Method, Path>>) => {
    const mth = method.toUpperCase() as Uppercase<typeof method>;
    const fn = client[mth] as ClientMethod<Paths, typeof method, Media>;
    const { data, error } = await fn(path, { signal, ...(init as any) }); // TODO: find a way to avoid as any
    if (error) {
      throw error;
    }

    return data;
  };

  const infiniteQueryFn = async <Method extends HttpMethod, Path extends PathsWithMethod<Paths, Method>, PageKeyAccessor extends PathKeyOfWithMethod<Paths, Method, Path>>({
    queryKey: [method, path, init, pageKeyAccessor],
    signal,
    pageParam,
  }: QueryFunctionContext<QueryKey<Paths, Method, Path, PageKeyAccessor>>) => {
    
    if (pageKeyAccessor !== undefined && pageParam !== undefined) {
      setNestedValue(init ?? {}, pageKeyAccessor, pageParam);
    }

    const mth = method.toUpperCase() as Uppercase<typeof method>;
    const fn = client[mth] as ClientMethod<Paths, typeof method, Media>;
    const { data, error } = await fn(path, { signal, ...(init as any) }); // TODO: find a way to avoid as any
    if (error) {
      throw error;
    }

    return data;
  };

  const queryOptions: QueryOptionsFunction<Paths, Media> = (method, path, ...[init, options]) => ({
    queryKey: [method, path, init as InitWithUnknowns<typeof init>,] as const,
    queryFn,
    ...options,
  });

  const infiniteQueryOptions = <
    Method extends HttpMethod,
    Path extends PathsWithMethod<Paths, Method>,
    Init extends MaybeOptionalInit<Paths[Path], Method & keyof Paths[Path]>,
    Response extends Required<FetchResponse<any, Init, Media>>,
  >(
    method: Method,
    path: Path,
    init?: InitWithUnknowns<Init>,
    options?: Omit<
      UseInfiniteQueryOptions<
        Response["data"],
        Response["error"],
        Response["data"],
        number,
        QueryKey<Paths, Method, Path>
      >,
      "queryKey" | "queryFn"
    > & { pageAccessor?: PathKeyOfWithMethod<Paths, Method, Path> },
  ) => ({
    queryKey: [method, path, init, options?.pageAccessor] as const,
    queryFn: infiniteQueryFn,
    ...options,
  });

  return {
    queryOptions,
    useQuery: (method, path, ...[init, options, queryClient]) =>
      useQuery(queryOptions(method, path, init as InitWithUnknowns<typeof init>, options), queryClient),
    useSuspenseQuery: (method, path, ...[init, options, queryClient]) =>
      useSuspenseQuery(queryOptions(method, path, init as InitWithUnknowns<typeof init>, options), queryClient),
    useInfiniteQuery: (method, path, ...[init, options, queryClient]) => {
      const baseOptions = infiniteQueryOptions(method, path, init as InitWithUnknowns<typeof init>, options as any); // TODO: find a way to avoid as any
      console.log(baseOptions);
      return useInfiniteQuery(
        {
          ...baseOptions,
          getNextPageParam: (lastPage: any, allPages: any[], lastPageParam: number, allPageParams: number[]) =>
            options?.getNextPageParam?.(lastPage, allPages, lastPageParam, allPageParams) ?? allPages.length,
        } as any,
        queryClient,
      );
    },
    useMutation: (method, path, options, queryClient) =>
      useMutation(
        {
          mutationKey: [method, path],
          mutationFn: async (init) => {
            const mth = method.toUpperCase() as Uppercase<typeof method>;
            const fn = client[mth] as ClientMethod<Paths, typeof method, Media>;
            const { data, error } = await fn(path, init as InitWithUnknowns<typeof init>);
            if (error) {
              throw error;
            }

            return data as Exclude<typeof data, undefined>;
          },
          ...options,
        },
        queryClient,
      ),
  };
}
