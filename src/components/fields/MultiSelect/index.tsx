import { lazy } from "react";
import { IFieldConfig, FieldType } from "components/fields/types";
import withPopoverCell from "../_withTableCell/withPopoverCell";

import MultiSelectIcon from "assets/icons/MultiSelect";
import BasicCell from "../_BasicCell/BasicCellNull";
import InlineCell from "./InlineCell";
import NullEditor from "components/Table/editors/NullEditor";

const PopoverCell = lazy(
  () =>
    import("./PopoverCell" /* webpackChunkName: "PopoverCell-MultiSelect" */)
);
const SideDrawerField = lazy(
  () =>
    import(
      "./SideDrawerField" /* webpackChunkName: "SideDrawerField-MultiSelect" */
    )
);
const Settings = lazy(
  () =>
    import(
      "../SingleSelect/Settings" /* webpackChunkName: "Settings-SingleSelect" */
    )
);

export const config: IFieldConfig = {
  type: FieldType.multiSelect,
  name: "Multi Select",
  group: "Select",
  dataType: "string[]",
  initialValue: [],
  initializable: true,
  icon: <MultiSelectIcon />,
  description:
    "Multiple values from predefined options. Options are searchable and users can optionally input custom values.",
  TableCell: withPopoverCell(BasicCell, InlineCell, PopoverCell, {
    anchorOrigin: { horizontal: "left", vertical: "bottom" },
    transparent: true,
  }),
  TableEditor: NullEditor as any,
  SideDrawerField,
  settings: Settings,
  csvImportParser: (v) => {
    if (v.includes(",")) {
      return v.split(",").map((i) => i.trim());
    } else if (v !== "") return [v];
    else return v;
  },
  requireConfiguration: true,
};
export default config;
