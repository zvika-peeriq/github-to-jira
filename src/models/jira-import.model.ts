interface Attachment {
  name?: string;
  attacher?: string;
  created?: Date;
  uri?: string;
  description?: string;
}

interface Issue {
  assignee?: string;
  watchers?: string[];
  key?: string;
  status?: string;
  reporter?: string | unknown;
  description?: string;
  externalId?: string;
  comments?: Comment[];
  summary?: string;
  repo?: string;
  issueType?: 'Task' | 'Bug' | 'User Story';
  created?: Date;
  attachments?: Attachment[];
  labels: string[];
}

interface User {
  name?: string;
  email?: string;
}

interface Project {
  name?: string;
  key?: string;
  issues?: Issue[];
}

export interface Comment {
  author?: string | unknown;
  body?: string;
  created?: Date;
}

export interface JIRAImport {
  users?: User[];
  projects?: Project[];
}
