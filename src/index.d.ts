export type HubEvent =
  | { type: "school.selected"; schoolCode: string; schoolName: string }
  | { type: "student.mapped"; studentId: string; schoolCode: string }
  | { type: "calendar.examWeek"; schoolCode: string; start: string; end: string }
  | { type: "slot.suggested"; date: string; start: string };

export type HubOptions = {
  officeCode?: string;
  schoolCodes?: string[];
  neisKey?: string;
  proxyUrl?: string;
  locale?: "ko";
  theme?: "light" | "dark";
  features?: {
    clock?: boolean;
    calendar?: boolean;
    meals?: boolean;
    map?: boolean;
    reading?: boolean;
    gap?: boolean;
    students?: boolean;
  };
  onEvent?: (e: HubEvent) => void;
  react?: unknown;
};

export function mountOkgilEduHub(
  el: HTMLElement,
  options?: HubOptions
): { unmount: () => void };

export function OkgilEduHub(props: HubOptions): unknown;

export const OFFICE_CODE: string;
export const OKGIL_SCHOOLS: Array<{
  officeCode: string;
  schoolCode: string;
  name: string;
  kind: string;
  address: string;
  tel: string;
  homepage: string;
  endpoint: string;
}>;
export const READING_LOOP: Array<{
  isbn: string;
  title: string;
  author: string;
  why: string;
  band: string;
}>;

export function fetchSchoolInfo(options?: HubOptions & { schoolCode?: string; name?: string }): Promise<unknown[]>;
export function fetchSchedule(school: { officeCode: string; schoolCode: string }, range: { from: string; to: string }, options?: HubOptions): Promise<unknown[]>;
export function fetchMeals(school: { officeCode: string; schoolCode: string }, dateYmd: string, options?: HubOptions): Promise<unknown[]>;
export function fetchTimetable(school: { officeCode: string; schoolCode: string; kind?: string; endpoint?: string }, dateYmd: string, extra?: object, options?: HubOptions): Promise<unknown[]>;
