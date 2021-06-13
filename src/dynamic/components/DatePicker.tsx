import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import generatePicker, { PickerDateProps } from 'antd/es/date-picker/generatePicker';

export type DatePickerProps = PickerDateProps<Dayjs>;

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export default DatePicker;
