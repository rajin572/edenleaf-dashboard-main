import type { IApiResponse, IMeta } from "./common.type";

export type INewsletterSubscriberStatus = "subscribed" | "unsubscribed";

export interface INewsletterSubscriber {
  _id: string;
  email: string;
  status: INewsletterSubscriberStatus;
  subscribedAt: string;
  unsubscribedAt?: string;
}

export type IGetNewsletterSubscriberListResponse = IApiResponse<{ data: INewsletterSubscriber[]; meta: IMeta }>;

export interface INewsletterCampaignValues {
  subject: string;
  message: string;
}
