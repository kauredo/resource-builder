/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assetVersions from "../assetVersions.js";
import type * as assets from "../assets.js";
import type * as auth from "../auth.js";
import type * as cardGameImages from "../cardGameImages.js";
import type * as characterActions from "../characterActions.js";
import type * as characterGroups from "../characterGroups.js";
import type * as characters from "../characters.js";
import type * as collections from "../collections.js";
import type * as contentGeneration from "../contentGeneration.js";
import type * as frameActions from "../frameActions.js";
import type * as frames from "../frames.js";
import type * as geminiErrors from "../geminiErrors.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as presetData from "../presetData.js";
import type * as resources from "../resources.js";
import type * as starterTemplateData from "../starterTemplateData.js";
import type * as starterTemplates from "../starterTemplates.js";
import type * as styleActions from "../styleActions.js";
import type * as styles from "../styles.js";
import type * as userActions from "../userActions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assetVersions: typeof assetVersions;
  assets: typeof assets;
  auth: typeof auth;
  cardGameImages: typeof cardGameImages;
  characterActions: typeof characterActions;
  characterGroups: typeof characterGroups;
  characters: typeof characters;
  collections: typeof collections;
  contentGeneration: typeof contentGeneration;
  frameActions: typeof frameActions;
  frames: typeof frames;
  geminiErrors: typeof geminiErrors;
  http: typeof http;
  images: typeof images;
  presetData: typeof presetData;
  resources: typeof resources;
  starterTemplateData: typeof starterTemplateData;
  starterTemplates: typeof starterTemplates;
  styleActions: typeof styleActions;
  styles: typeof styles;
  userActions: typeof userActions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
