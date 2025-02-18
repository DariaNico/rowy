import { useEffect } from "react";
import _findIndex from "lodash/findIndex";

import useDoc from "./useDoc";
import { db } from "../firebase";
import { SETTINGS, TABLE_GROUP_SCHEMAS, TABLE_SCHEMAS } from "config/dbPaths";

const useSettings = () => {
  const [settingsState, documentDispatch] = useDoc({ path: SETTINGS });
  useEffect(() => {
    //updates tables data on document change
    const { doc, tables } = settingsState;
    if (doc && tables !== doc.tables) {
      // const sections = _groupBy(
      //   tables.filter(
      //     table =>
      //       !table.roles || table.roles.some(role => userRoles.includes(role))
      //   ),
      //   "section"
      // );
      documentDispatch({ tables: doc.tables, roles: doc.roles });
    }
  }, [settingsState]);

  const createTable = async (data: {
    id: string;
    name: string;
    collection: string;
    description: string;
    tableType: string;
    roles: string[];
    schemaSource: any;
  }) => {
    const { tables } = settingsState;
    const { schemaSource, ...tableSettings } = data;
    const tableSchemaPath = `${
      tableSettings.tableType !== "collectionGroup"
        ? TABLE_SCHEMAS
        : TABLE_GROUP_SCHEMAS
    }/${tableSettings.id}`;
    const tableSchemaDocRef = db.doc(tableSchemaPath);

    // Get columns from schemaSource if provided
    let columns = [];
    if (schemaSource) {
      const schemaSourcePath = `${
        tableSettings.tableType !== "collectionGroup"
          ? TABLE_SCHEMAS
          : TABLE_GROUP_SCHEMAS
      }/${schemaSource.id}`;
      const sourceDoc = await db.doc(schemaSourcePath).get();
      columns = sourceDoc.get("columns");
    }

    // Appends table to settings doc
    await db.doc(SETTINGS).set(
      {
        tables: Array.isArray(tables)
          ? [...tables, tableSettings]
          : [tableSettings],
      },
      { merge: true }
    );

    // Creates schema doc with columns
    await tableSchemaDocRef.set({ columns }, { merge: true });
  };

  const updateTable = async (data: {
    id: string;
    name: string;
    collection: string;
    description: string;
    roles: string[];
  }) => {
    const { tables } = settingsState;
    const newTables = Array.isArray(tables) ? [...tables] : [];
    const foundIndex = _findIndex(newTables, { id: data.id });
    const tableIndex = foundIndex > -1 ? foundIndex : tables.length;
    newTables[tableIndex] = { ...newTables[tableIndex], ...data };

    await db.doc(SETTINGS).set({ tables: newTables }, { merge: true });
  };

  const deleteTable = (id: string) => {
    const { tables } = settingsState;

    db.doc(SETTINGS).update({
      tables: tables.filter((table) => table.id !== id),
    });
    db.collection(TABLE_SCHEMAS).doc(id).delete();
  };
  const settingsActions = { createTable, updateTable, deleteTable };
  return [settingsState, settingsActions];
};

export default useSettings;
