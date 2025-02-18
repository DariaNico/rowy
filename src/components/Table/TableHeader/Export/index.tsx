import { useState, useMemo } from "react";

import { makeStyles, createStyles } from "@mui/styles";
import { DialogContent, Tab, Divider } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import TableHeaderButton from "../TableHeaderButton";
import ExportIcon from "assets/icons/Export";

import Modal from "components/Modal";
import ExportDetails from "./Export";
import DownloadDetails from "./Download";

import { useProjectContext } from "contexts/ProjectContext";
import { db } from "../../../../firebase";
import { isCollectionGroup } from "utils/fns";

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      [theme.breakpoints.up("sm")]: {
        maxWidth: 440,
        height: 610,
      },
    },

    tab: { minWidth: 0 },

    tabPanel: {
      marginTop: "var(--dialog-contents-spacing)",
      marginBottom: "calc(var(--dialog-spacing) * -1)",
      padding: 0,

      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      height:
        "calc(100% - var(--dialog-contents-spacing) + var(--dialog-spacing))",

      "& > * + *": { marginTop: "var(--dialog-contents-spacing)" },
      "&[hidden]": { display: "none" },
    },
  })
);

export default function Export() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"Export" | "Download">("Export");
  const { tableState } = useProjectContext();

  const query: any = useMemo(() => {
    let _query = isCollectionGroup()
      ? db.collectionGroup(tableState?.tablePath!)
      : db.collection(tableState?.tablePath!);
    // add filters
    tableState?.filters.forEach((filter) => {
      _query = _query.where(
        filter.key,
        filter.operator as firebase.default.firestore.WhereFilterOp,
        filter.value
      );
    });
    // optional order results
    if (tableState?.orderBy) {
      tableState?.orderBy?.forEach((orderBy) => {
        _query = _query.orderBy(orderBy.key, orderBy.direction);
      });
    }
    return _query.limit(10000);
  }, [tableState?.tablePath, tableState?.orderBy, tableState?.filters]);

  const handleClose = () => {
    setOpen(false);
    setMode("Export");
  };

  return (
    <>
      <TableHeaderButton
        title="Export/Download"
        onClick={() => setOpen(true)}
        icon={<ExportIcon />}
      />

      {open && (
        <TabContext value={mode}>
          <Modal
            onClose={handleClose}
            classes={{ paper: classes.paper }}
            title={mode}
            header={
              <>
                <DialogContent style={{ flexGrow: 0, flexShrink: 0 }}>
                  {(tableState?.filters && tableState?.filters.length !== 0) ||
                  (tableState?.orderBy && tableState?.orderBy.length !== 0)
                    ? "The filters and sorting applied to the table will be used in the export."
                    : "No filters or sorting will be applied on the exported data."}
                </DialogContent>

                <TabList
                  onChange={(_, v) => setMode(v)}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="Modal tabs"
                  action={(actions) =>
                    setTimeout(() => actions?.updateIndicator(), 200)
                  }
                  sx={{ mt: 1 }}
                >
                  <Tab className={classes.tab} label="Export" value="Export" />
                  <Tab
                    className={classes.tab}
                    label="Download attachments"
                    value="Download"
                  />
                </TabList>
                <Divider style={{ marginTop: -1 }} />
              </>
            }
            ScrollableDialogContentProps={{
              disableTopDivider: true,
              disableBottomDivider: true,
            }}
          >
            <TabPanel value="Export" className={classes.tabPanel}>
              <ExportDetails query={query} closeModal={handleClose} />
            </TabPanel>

            <TabPanel value="Download" className={classes.tabPanel}>
              <DownloadDetails query={query} closeModal={handleClose} />
            </TabPanel>
          </Modal>
        </TabContext>
      )}
    </>
  );
}
