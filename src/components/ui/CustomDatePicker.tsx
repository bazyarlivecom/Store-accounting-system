import React from 'react';
import DatePickerModule from "react-multi-date-picker";
import TimePickerModule from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const DatePicker = (DatePickerModule as any).default || DatePickerModule;
const TimePicker = (TimePickerModule as any).default || TimePickerModule;

const TodayButton = ({ setValue, range }: any) => {
  return (
    <div className="flex justify-center p-2 border-t border-gray-100 bg-gray-50/50">
      <button
        type="button"
        onClick={() => {
          if (range) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endToday = new Date();
            endToday.setHours(23, 59, 59, 999);
            setValue([today, endToday]);
          } else {
            setValue(new Date());
          }
        }}
        className="w-full py-1.5 px-4 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors"
      >
        هم‌اکنون (امروز)
      </button>
    </div>
  );
};

export default function CustomDatePicker(props: any) {
  return (
    <DatePicker
      {...props}
      format={props.format || (props.range ? "YYYY/MM/DD" : "YYYY/MM/DD HH:mm")}
      plugins={[
        ...(!props.range ? [<TimePicker position="bottom" />] : []),
        <TodayButton position="bottom" range={props.range} />,
        ...(props.plugins || [])
      ]}
    />
  );
}
