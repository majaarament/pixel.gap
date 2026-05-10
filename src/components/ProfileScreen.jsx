// Player profile setup screen — collects role, team, and entity before the game begins.

import React, { useState } from "react";

const ROLE_OPTIONS = [
  {
    value: "employee",
    label: "Employee",
    detail: "individual contributor, analyst, or team member",
  },
  {
    value: "team_lead",
    label: "Team Lead",
    detail: "leads a team or workstream within a project or practice",
  },
  {
    value: "manager",
    label: "Manager",
    detail: "people leader, engagement manager, or practice manager",
  },
  {
    value: "partner",
    label: "Partner",
    detail: "partner, director, or senior leadership",
  },
];

const DEPARTMENT_OPTIONS = [
  { name: "Application Managed Services (Microsoft)", primary: "Netherlands, Belgium", supporting: "India" },
  { name: "Application Managed Services (SAP)", primary: "Belgium, Netherlands, France", supporting: "India, Hungary" },
  { name: "Azure & Cloud Architecture", primary: "Netherlands, Belgium, USA", supporting: "India" },
  { name: "Customer Experience & Digital", primary: "Belgium, Netherlands, France", supporting: "Malaysia, Philippines" },
  { name: "Data & AI", primary: "Netherlands, Belgium, USA", supporting: "India, Hungary" },
  { name: "DM4Mill (Mill Products MES)", primary: "Belgium (Product Owner)", supporting: "Germany, Netherlands, Global" },
  { name: "Marketing", primary: "all entities", supporting: "-" },
  { name: "Microsoft Dynamics 365", primary: "Netherlands, Belgium, UK", supporting: "India" },
  { name: "Modern Workplace", primary: "Netherlands, Belgium", supporting: "Philippines" },
  { name: "OpenText Information Management", primary: "Belgium, Netherlands, Germany", supporting: "Hungary" },
  { name: "Sales", primary: "all entities", supporting: "-" },
  { name: "Salesforce CRM", primary: "Belgium, Netherlands, France", supporting: "India" },
  { name: "SAP Analytics & BI", primary: "Belgium, Netherlands", supporting: "India" },
  { name: "SAP Finance", primary: "Belgium, Netherlands, France", supporting: "Hungary, India" },
  { name: "SAP S/4HANA", primary: "Belgium, Netherlands, France, Germany, UK, USA, Canada", supporting: "India, Hungary, Malaysia" },
  { name: "SAP SuccessFactors (HR)", primary: "Belgium, Netherlands, France", supporting: "India, Philippines" },
  { name: "SAP Supply Chain & Manufacturing", primary: "Belgium, Germany, Netherlands", supporting: "Hungary, China" },
  { name: "Strategy & Business Consulting", primary: "Belgium (DI), Netherlands, France, Germany, UK", supporting: "Hungary, India" },
  { name: "Support Finance", primary: "all entities", supporting: "-" },
  { name: "Support HR", primary: "all entities", supporting: "-" },
  { name: "Support IT", primary: "all entities", supporting: "-" },
  { name: "Support Office/Facility", primary: "all entities", supporting: "-" },
];

const ENTITY_GROUPS = [
  {
    region: "Europe",
    entities: [
      { entity: "delaware International", city: "Antwerp", office: "DI HQ", country: "Belgium" },
      { entity: "delaware Belgium", city: "Ghent", office: "Office", country: "Belgium" },
      { entity: "delaware Belgium", city: "Kortrijk", office: "DBE HQ", country: "Belgium" },
      { entity: "delaware Belgium", city: "Liège", office: "Office", country: "Belgium" },
      { entity: "delaware Belgium", city: "Lummen", office: "Office", country: "Belgium" },
      { entity: "delaware Belgium", city: "Wavre", office: "Office", country: "Belgium" },
      { entity: "delaware Netherlands bv", city: "Den Bosch", office: "DNL HQ", country: "Netherlands" },
      { entity: "delaware Netherlands bv", city: "Naarden", office: "Office", country: "Netherlands" },
      { entity: "delaware France sas", city: "Lille (La Madeleine)", office: "Office", country: "France" },
      { entity: "delaware France sas", city: "Lyon", office: "DFR HQ", country: "France" },
      { entity: "delaware France sas", city: "Nantes", office: "Office", country: "France" },
      { entity: "delaware France sas", city: "Paris", office: "Office", country: "France" },
      { entity: "delaware Luxembourg sa", city: "Belvaux", office: "Office", country: "Luxembourg" },
      { entity: "delaware Germany gmbh", city: "Hamburg", office: "Office", country: "Germany" },
      { entity: "delaware Germany gmbh", city: "Zweibrücken", office: "Office", country: "Germany" },
      { entity: "delaware Hungary kft", city: "Budapest", office: "Office", country: "Hungary" },
      { entity: "delaware UK ltd", city: "Bristol", office: "Office", country: "United Kingdom" },
      { entity: "delaware Ireland ltd", city: "Dublin", office: "Office", country: "Ireland" },
    ],
  },
  {
    region: "Asia & Pacific",
    entities: [
      { entity: "delaware China", city: "Shanghai", office: "Office", country: "China" },
      { entity: "delaware China", city: "Suzhou", office: "Office", country: "China" },
      { entity: "delaware China", city: "Chengdu", office: "Office", country: "China" },
      { entity: "delaware China", city: "Harbin", office: "Office", country: "China" },
      { entity: "delaware India pvt ltd", city: "Noida", office: "GDC", country: "India" },
      { entity: "delaware Malaysia sdn bhd", city: "Kuala Lumpur", office: "GDC", country: "Malaysia" },
      { entity: "delaware Philippines inc", city: "Taguig", office: "GDC", country: "Philippines" },
      { entity: "delaware Singapore pte ltd", city: "Singapore", office: "Office", country: "Singapore" },
    ],
  },
  {
    region: "Americas",
    entities: [
      { entity: "delaware USA inc", city: "Multiple locations", office: "Office", country: "United States" },
      { entity: "delaware Brazil ltda", city: "Alphaville", office: "GDC", country: "Brazil" },
      { entity: "delaware Canada inc", city: "Toronto", office: "Office", country: "Canada" },
    ],
  },
  {
    region: "Africa",
    entities: [
      { entity: "delaware Morocco sarl", city: "Casablanca", office: "GDC", country: "Morocco" },
    ],
  },
];

function makeEntityValue(entity) {
  return `${entity.entity}|${entity.city}|${entity.office}|${entity.country}`;
}

function makeEntityLabel(entity) {
  const officeTag = entity.office && entity.office !== "Office" ? ` (${entity.office})` : "";
  return `${entity.country} — ${entity.city}${officeTag}`;
}

function findDepartment(name) {
  return DEPARTMENT_OPTIONS.find((department) => department.name === name) || null;
}

function findEntity(value) {
  return ENTITY_GROUPS
    .flatMap((group) => group.entities)
    .find((entity) => makeEntityValue(entity) === value) || null;
}

export default function ProfileScreen({ onSubmit }) {
  const [roleLevel, setRoleLevel] = useState("");
  const [team, setTeam] = useState("");
  const [entity, setEntity] = useState("");
  const [error, setError] = useState("");
  const canSubmit = Boolean(roleLevel && team && entity);
  const selectedDepartment = findDepartment(team);
  const selectedEntity = findEntity(entity);

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      setError("please select all three options to continue.");
      return;
    }
    setError("");
    onSubmit({
      roleLevel,
      team,
      department: team,
      departmentPrimaryEntities: selectedDepartment?.primary || "",
      departmentSupportingEntities: selectedDepartment?.supporting || "",
      entity: selectedEntity?.entity || entity,
      entityCity: selectedEntity?.city || "",
      entityOfficeType: selectedEntity?.office || "",
      country: selectedEntity?.country || "",
      entityLabel: selectedEntity ? makeEntityLabel(selectedEntity) : entity,
    });
  }

  return (
    <div style={styles.screen}>
      <div style={styles.screenGlow} />
      <div style={styles.screenGlowSecondary} />
      <div style={styles.panel}>
        <div style={styles.panelTopBar} />
        <div style={styles.inner}>
          <div style={styles.kickerRow}>
            <div style={styles.stepChip}>profile setup</div>
          </div>

          <div style={styles.heroBlock}>
            <h1 style={styles.heading}>set your starting point</h1>
            <p style={styles.body}>
              a few quick details help make the experience feel more relevant. answers are
              anonymous and only used in aggregate.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <div style={styles.questionNumber}>1</div>
                <div>
                  <label style={styles.label}>your level</label>
                  <p style={styles.helper}>pick the option that best matches your current role.</p>
                </div>
              </div>
              <div style={styles.roleRow}>
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    style={{
                      ...styles.roleButton,
                      ...(roleLevel === opt.value ? styles.roleButtonActive : {}),
                    }}
                    onClick={() => setRoleLevel(opt.value)}
                  >
                    <span style={styles.roleButtonTitle}>{opt.label}</span>
                    <span style={styles.roleButtonDetail}>{opt.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <div style={styles.questionNumber}>2</div>
                  <div>
                    <label style={styles.label} htmlFor="team">department / solution</label>
                    <p style={styles.helper}>select the solution or support function you work in most closely.</p>
                  </div>
                </div>
                <select
                  id="team"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  style={styles.select}
                >
                  <option value="">select a team...</option>
                  {DEPARTMENT_OPTIONS.map((department) => (
                    <option key={department.name} value={department.name}>{department.name}</option>
                  ))}
                </select>
                {selectedDepartment && (
                  <p style={styles.selectionMeta}>
                    primary: {selectedDepartment.primary} · support: {selectedDepartment.supporting}
                  </p>
                )}
              </div>

              <div style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <div style={styles.questionNumber}>3</div>
                  <div>
                    <label style={styles.label} htmlFor="entity">entity</label>
                    <p style={styles.helper}>select the office or entity you are based in.</p>
                  </div>
                </div>
                <select
                  id="entity"
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  style={styles.select}
                >
                  <option value="">select an office...</option>
                  {ENTITY_GROUPS.map((group) => (
                    <optgroup key={group.region} label={group.region}>
                      {group.entities.map((office) => (
                        <option key={makeEntityValue(office)} value={makeEntityValue(office)}>
                          {makeEntityLabel(office)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedEntity && (
                  <p style={styles.selectionMeta}>
                    {selectedEntity.entity} · {selectedEntity.office}
                  </p>
                )}
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.footerRow}>
              <p style={styles.notice}>
                anonymous and aggregated. no individual responses are visible to management.
              </p>
              <button type="submit" style={styles.submitButton}>
                start the journey
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    height: "100vh",
    background: "#7f9362",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  screenGlow: {
    display: "none",
  },
  screenGlowSecondary: {
    display: "none",
  },
  panel: {
    width: "min(780px, calc(100vw - 32px))",
    height: "min(680px, calc(100vh - 24px))",
    background: "#eadfbc",
    borderRadius: 0,
    overflow: "hidden",
    border: "4px solid #33442f",
    boxShadow: "0 16px 0 #273320, 0 32px 48px rgba(15, 24, 18, 0.28)",
    position: "relative",
    zIndex: 1,
  },
  panelTopBar: {
    height: 12,
    background: "#5c7d53",
    borderBottom: "4px solid #33442f",
  },
  inner: {
    padding: "clamp(12px, 2.2vh, 22px)",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    background: "#eadfbc",
  },
  kickerRow: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  stepChip: {
    padding: "6px 10px",
    background: "#32462f",
    color: "#edf3d2",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    border: "2px solid #24331f",
  },
  heroBlock: {
    marginBottom: 10,
  },
  heading: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(22px, 3.4vw, 40px)",
    fontWeight: 900,
    letterSpacing: 0,
    color: "#1f2d1c",
    margin: "0 0 8px",
    lineHeight: 1.05,
  },
  body: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(12px, 1.15vw, 15px)",
    lineHeight: 1.3,
    color: "#42523d",
    margin: 0,
    maxWidth: 540,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 8,
  },
  questionCard: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    background: "#f5ecd1",
    border: "3px solid #c9b487",
    boxShadow: "inset 0 2px 0 #fff8e6",
    padding: "10px 10px 12px",
  },
  questionHeader: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  questionNumber: {
    width: 28,
    height: 28,
    background: "#32462f",
    color: "#edf3d2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 13,
    fontWeight: 900,
    flexShrink: 0,
    border: "2px solid #24331f",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "clamp(11px, 1.1vw, 13px)",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#46563f",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    marginBottom: 4,
  },
  helper: {
    margin: 0,
    color: "#6a7356",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 11,
    lineHeight: 1.35,
  },
  roleRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 7,
  },
  roleButton: {
    padding: "9px 10px",
    background: "#dde5cf",
    border: "3px solid #b4c0a3",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    color: "#2f412b",
    cursor: "pointer",
    letterSpacing: 0,
    boxShadow: "0 3px 0 #b8c3a7",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    minHeight: 58,
    textAlign: "left",
  },
  roleButtonActive: {
    background: "#fff4df",
    border: "3px solid #24401e",
    boxShadow: "0 3px 0 #8b935e",
  },
  roleButtonTitle: {
    fontSize: "clamp(12px, 1.15vw, 15px)",
    fontWeight: 800,
  },
  roleButtonDetail: {
    fontSize: 10,
    lineHeight: 1.25,
    color: "#5a6c54",
  },
  select: {
    padding: "9px 10px",
    background: "#fff9ea",
    border: "3px solid #ccb993",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(12px, 1.15vw, 15px)",
    color: "#20301d",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    boxShadow: "inset 0 2px 0 #fffef8",
    cursor: "pointer",
    appearance: "auto",
  },
  selectionMeta: {
    margin: "4px 0 0",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 10,
    lineHeight: 1.25,
    color: "#667057",
    fontWeight: 800,
  },
  error: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 13,
    color: "#8b3a2a",
    margin: 0,
    background: "#f6ddd5",
    border: "2px solid #d9a497",
    padding: "10px 12px",
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 4,
  },
  submitButton: {
    padding: "10px 18px",
    background: "#f4d17c",
    color: "#24321f",
    border: "4px solid #6f5524",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(15px, 1.8vw, 21px)",
    fontWeight: 900,
    letterSpacing: 0,
    cursor: "pointer",
    alignSelf: "flex-start",
    boxShadow: "0 5px 0 #a27b32",
  },
  notice: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(10px, 0.95vw, 12px)",
    color: "#667057",
    lineHeight: 1.4,
    margin: 0,
    maxWidth: 360,
  },
};
