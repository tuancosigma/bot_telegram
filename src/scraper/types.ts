export interface RawPost {
  url: string;
  groupName: string;
  authorName: string;
  location: string | null;
  textContent: string;
  postedAtRelative: string;
  imageUrls: string[];
}
