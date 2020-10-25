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
    flexDirection: "row",
    alignItems: "center",
    fontSize: 10,
    marginRight: 3,
    width: 80,
    backgroundColor: "#E2EFDA",
  },
  mainHeaderCountsWrapper: {
    flexDirection: "column",
    fontSize: 10,
    marginRight: 3,
    width: 66,
    backgroundColor: "#D9FFF2",
  },
  mainHeaderGameDate: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  mainHeaderDateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 3,
    backgroundColor: "#808080",
    color: "#ffffff",
    height: 20,
  },
  mainHeaderDivisionNameWrapper: {
    marginRight: 3,
    width: 50,
    backgroundColor: "#D9FFF2",
  },
  mainHeaderCountsIndividualWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 3,
    backgroundColor: "#D9FFF2",
  },
  mainHeaderGameWrapper: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    color: "#000000",    
  },
  mainHeaderGameCellWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 3,
    width: 80,
    height: 20,
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
    width: 20,
  },
  mainHeaderNameCell: {
    fontSize: 10,
    margin: 0,
    marginTop: 1,
    textAlign: "center",
    width: 80,
  },
  logoWrapper: {
    position: "absolute",
    top: 0,
    right: 20,
    width: 70,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  logo: {
    objectFit: "contain",
    height: 40,
    marginLeft: 10,
  },
});

export { styles };
