export interface Project {
    id: string
    name: string
    url: string
    state: string
    revision: number
    visibility: string
    lastUpdateTime: string
}

export interface Repository {
    id: string
    name: string
    url: string
    project: Project
    defaultBranch: string
    size: number
    remoteUrl: string
    sshUrl: string
    webUrl: string
    isDisabled: boolean
    isInMaintenance: boolean
}

export interface Branch {
    name: string
    objectId: string
    creator: Creator
    url: string
}

export interface Creator {
    displayName: string
    url: string
    _links: Links
    id: string
    uniqueName: string
    imageUrl: string
    descriptor: string
}

export interface Links {
    avatar: Avatar
}

export interface Avatar {
    href: string
}


export interface Commit {
    commitId: string
    author: Author
    committer: Committer
    comment: string
    changeCounts: ChangeCounts
    url: string
    remoteUrl: string
    commentTruncated?: boolean
}

export interface Author {
    name: string
    email: string
    date: string
}

export interface Committer {
    name: string
    email: string
    date: string
}

export interface ChangeCounts {
    Add: number
    Edit: number
    Delete: number
}

export interface UpdateRefsResponse {
    repositoryId: string
    name: string
    oldObjectId: string
    newObjectId: string
    isLocked: boolean
    updateStatus: string
    success: boolean
}