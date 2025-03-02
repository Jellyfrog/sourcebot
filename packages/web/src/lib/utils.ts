import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import githubLogo from "../../public/github.svg";
import gitlabLogo from "../../public/gitlab.svg";
import giteaLogo from "../../public/gitea.svg";
import { ServiceError } from "./serviceError";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Adds a list of (potentially undefined) query parameters to a path.
 * 
 * @param path The path to add the query parameters to.
 * @param queryParams A list of key-value pairs (key=param name, value=param value) to add to the path.
 * @returns The path with the query parameters added.
 */
export const createPathWithQueryParams = (path: string, ...queryParams: [string, string | null][]) => {
    // Filter out undefined values
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    queryParams = queryParams.filter(([_key, value]) => value !== null);

    if (queryParams.length === 0) {
        return path;
    }

    const queryString = queryParams.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`).join('&');
    return `${path}?${queryString}`;
}

type CodeHostInfo = {
    type: "github" | "gitlab" | "gitea";
    repoName: string;
    costHostName: string;
    repoLink: string;
    icon: string;
    iconClassName?: string;
}

export const getRepoCodeHostInfo = (repoName: string): CodeHostInfo | undefined => {
    if (repoName.startsWith("github.com")) {
        return {
            type: "github",
            repoName: repoName.substring("github.com/".length),
            costHostName: "GitHub",
            repoLink: `https://${repoName}`,
            icon: githubLogo,
            iconClassName: "dark:invert",
        }
    }
    
    if (repoName.startsWith("gitlab.com")) {
        return {
            type: "gitlab",
            repoName: repoName.substring("gitlab.com/".length),
            costHostName: "GitLab",
            repoLink: `https://${repoName}`,
            icon: gitlabLogo,
        }
    }

    if (repoName.startsWith("gitea.com")) {
        return {
            type: "gitea",
            repoName: repoName.substring("gitea.com/".length),
            costHostName: "Gitea",
            repoLink: `https://${repoName}`,
            icon: giteaLogo,
        }
    }

    return undefined;
}

export const getCodeHostFilePreviewLink = (repoName: string, filePath: string): string | undefined => {
    const info = getRepoCodeHostInfo(repoName);

    if (info?.type === "github") {
        return `${info.repoLink}/blob/HEAD/${filePath}`;
    }

    if (info?.type === "gitlab") {
        return `${info.repoLink}/-/blob/HEAD/${filePath}`;
    }

    if (info?.type === "gitea") {
        return `${info.repoLink}/src/branch/HEAD/${filePath}`;
    }

    return undefined;
}

export const isServiceError = (data: unknown): data is ServiceError => {
    return typeof data === 'object' &&
        data !== null &&
        'statusCode' in data &&
        'errorCode' in data &&
        'message' in data;
}

export const getEnv = (env: string | undefined, defaultValue = '') => {
	return env ?? defaultValue;
}

export const getEnvNumber = (env: string | undefined, defaultValue: number = 0) => {
	return Number(env) ?? defaultValue;
}

export const getEnvBoolean = (env: string | undefined, defaultValue: boolean) => {
	if (!env) {
		return defaultValue;
	}
	return env === 'true' || env === '1';
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
export const base64Decode = (base64: string): string => {
    const binString = atob(base64);
    return Buffer.from(Uint8Array.from(binString, (m) => m.codePointAt(0)!).buffer).toString();
}
