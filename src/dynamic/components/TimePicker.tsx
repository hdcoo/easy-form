import React from 'react';
import { Dayjs } from 'dayjs';
import DatePicker from './DatePicker';
import { PickerTimeProps, RangePickerTimeProps } from 'antd/es/date-picker/generatePicker';
import { Omit } from 'antd/es/_util/type';

export type TimeRangePickerProps = RangePickerTimeProps<Dayjs> & React.RefAttributes<any>;

export type TimePickerProps = Omit<PickerTimeProps<Dayjs>, 'picker'>;

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => {
  return <DatePicker {...props} picker="time" mode={undefined} ref={ref} />;
});

TimePicker.displayName = 'TimePicker';

const TimeRangePicker = React.forwardRef<any, TimeRangePickerProps>((props, ref) => {
  return <DatePicker.RangePicker {...props} picker="time" mode={undefined} ref={ref} />;
});

export {TimeRangePicker};

export default TimePicker;
