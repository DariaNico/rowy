import React from "react";
import { useForm } from "react-hook-form";
import _sortBy from "lodash/sortBy";
import _isEmpty from "lodash/isEmpty";

import { Stack } from "@mui/material";

import { Values } from "./utils";
import { getFieldProp } from "components/fields";
import { IFieldConfig } from "components/fields/types";
import Autosave from "./Autosave";
import Reset from "./Reset";
import FieldWrapper from "./FieldWrapper";

import { useAppContext } from "contexts/AppContext";
import { useProjectContext } from "contexts/ProjectContext";

export interface IFormProps {
  values: Values;
}

export default function Form({ values }: IFormProps) {
  const { tableState } = useProjectContext();
  const { userDoc } = useAppContext();
  const userDocHiddenFields =
    userDoc.state.doc?.tables?.[`${tableState!.tablePath}`]?.hiddenFields ?? [];

  const fields = _sortBy(Object.values(tableState!.columns), "index").filter(
    (f) => !userDocHiddenFields.includes(f.name)
  );

  // Get initial values from fields config. This won’t be written to the db
  // when the SideDrawer is opened. Only dirty fields will be written
  const initialValues = fields.reduce(
    (a, { key, type }) => ({ ...a, [key]: getFieldProp("initialValue", type) }),
    {}
  );
  const { ref: docRef, ...rowValues } = values;
  const defaultValues = { ...initialValues, ...rowValues };

  const methods = useForm({ mode: "onBlur", defaultValues });
  const { control, reset, formState, getValues } = methods;
  const { dirtyFields } = formState;

  // const { sideDrawerRef } = useProjectContext();
  // useEffect(() => {
  //   const column = sideDrawerRef?.current?.cell?.column;
  //   if (!column) return;

  //   const elem = document.getElementById(`sidedrawer-label-${column}`)
  //     ?.parentNode as HTMLElement;

  //   // Time out for double-clicking on cells, which can open the null editor
  //   setTimeout(() => elem?.scrollIntoView({ behavior: "smooth" }), 200);
  // }, [sideDrawerRef?.current]);

  return (
    <form>
      <Autosave
        control={control}
        docRef={docRef}
        row={values}
        reset={reset}
        dirtyFields={dirtyFields}
      />

      <Reset
        dirtyFields={dirtyFields}
        reset={reset}
        defaultValues={defaultValues}
        getValues={getValues}
      />

      <Stack spacing={3}>
        {fields.map((field, i) => {
          // Derivative/aggregate field support
          let type = field.type;
          if (field.config && field.config.renderFieldType) {
            type = field.config.renderFieldType;
          }

          const fieldComponent: IFieldConfig["SideDrawerField"] = getFieldProp(
            "SideDrawerField",
            type
          );

          // Should not reach this state
          if (_isEmpty(fieldComponent)) {
            // console.error('Could not find SideDrawerField component', field);
            return null;
          }

          return (
            <FieldWrapper
              key={field.key ?? i}
              type={field.type}
              name={field.key}
              label={field.name}
              disabled={field.editable === false}
            >
              {React.createElement(fieldComponent, {
                column: field,
                control,
                docRef,
                disabled: field.editable === false,
                useFormMethods: methods,
              })}
            </FieldWrapper>
          );
        })}

        <FieldWrapper
          type="debug"
          name="_debug_path"
          label="Document path"
          debugText={values.ref?.path ?? values.id ?? "No ref"}
        />
      </Stack>
    </form>
  );
}
