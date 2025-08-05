import dayjs from "dayjs";

export function toDateOnly(datetime: Date | string): string {
  return dayjs(datetime).tz("Europe/Paris").format("YYYY-MM-DD");
}

export function toTimeOnly(datetime: Date | string): string {
  return dayjs(datetime).tz("Europe/Paris").format("HH:mm");
}
