import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    padding: "0 15px",
  },
  headerWrapper: {
    flexGrow: 1,
    marginRight: 50,
  },
  eventName: {
    marginBottom: 5,
    fontSize: 16,
    borderBottom: 2,
    borderColor: "#333",
  },
  eventNamePool: {
    textAlign: "center",
    fontSize: 20,
  },
  scheduleName: {
    marginBottom: 5,
    fontSize: 10,
    fontWeight: 600,
  },
  divisionName: {
    fontSize: 18,
    textAlign: "center",
  },
  divisionDate: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
  mainHeaderWrapper: {
    flexDirection: "row",
  },
  mainHeaderDivisionWrapper: {
    flexDirection: "column",
    textAlign: "center",
    fontSize: 10,
    marginRight: 3,
    width: 80,
    backgroundColor: "#E2EFDA",
  },
  mainHeaderCountsWrapper: {
    flexDirection: "column",
    fontSize: 10,
    marginRight: 3,
    width: 96,
    backgroundColor: "#D9FFF2",
  },
  mainHeaderGameDate: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  mainHeaderDateWrapper: {
    fontSize: 10,
    marginRight: 3,
    backgroundColor: "#808080",
    color: "#ffffff",
  },
  mainHeaderDivisionNameWrapper: {
    marginRight: 3,
    width: 50,
    backgroundColor: "#D9FFF2",
  },
  mainHeaderCountsIndividualWrapper: {
    flexDirection: "row",
    marginRight: 3,
    backgroundColor: "#D9FFF2",
  },
  mainHeaderGameWrapper: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  mainHeaderGameCellWrapper: {
    marginRight: 3,
    width: 80,
  },
  mainHeaderCell: {
    fontSize: 10,
    margin: 3,
    textAlign: "center",
  },
  mainHeaderCountCell: {
    fontSize: 8,
    marginRight: 3,
    marginTop: 1,
    textAlign: "center",
    width: 30,
  },
  mainHeaderNameCell: {
    fontSize: 10,
    margin: 0,
    marginTop: 1,
    textAlign: "center",
    width: 80,
  },
  logoWrapper: {
    width: 70,
  },
  logo: {
    objectFit: "contain",
    height: 100,
    marginLeft: 20,
  },
});

export { styles };
