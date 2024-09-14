import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ja from "date-fns/locale/ja";

const CustomDatePicker = ({ ...props }: DatePickerProps<Date>) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <DatePicker<Date>
        {...props}
        slots={{
          textField: (params) => (
            <TextField
              {...params}
              variant="standard"
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
              }}
              inputProps={{
                ...params.inputProps,
                style: {
                  textAlign: "center", // 横方向のテキスト中央揃え
                  padding: 0, // 余白をリセット
                  height: "100%", // 高さを100%に設定
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-root": {
                  display: "flex",
                  alignItems: "center", // 縦方向の中央揃え
                },
                "& .MuiInputBase-input": {
                  textAlign: "center", // 横方向のテキスト中央揃え
                  padding: "0", // 余白をリセット
                },
              }}
            />
          ),
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
