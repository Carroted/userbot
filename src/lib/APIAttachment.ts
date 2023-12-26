export default interface APIAttachment {
    content_type: string;
    filename: string;
    height: number | null;
    id: string;
    proxy_url: string;
    size: number;
    url: string;
    width: number | null;
}