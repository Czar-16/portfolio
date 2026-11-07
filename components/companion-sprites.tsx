import styles from "./cursor-companion.module.css";

type Kind = "dog" | "cat" | "robot" | "ghost" | "f1";
type View = "side" | "front" | "back" | "toward" | "away";
const views: View[] = ["side", "front", "back", "toward", "away"];
const ink = "#40313a";
type Pose =
  | "idle"
  | "0"
  | "1"
  | "alert"
  | "look"
  | "groom"
  | "tired"
  | "sleep0"
  | "sleep1";
const poses: Pose[] = [
  "idle",
  "0",
  "1",
  "alert",
  "look",
  "groom",
  "tired",
  "sleep0",
  "sleep1",
];

// Each pair is an authored outline and inset, in the original 32px grid.
const animalFeet = {
  side: [
    [
      "M8 22H12V25H10V27H6V30H2V27H5V25H8ZM22 22H26V25H28V27H31V30H26V28H24V26H22Z",
      "M9 23H11V24H9V26H7V28H4V29H5V27H6V26H9ZM23 23H25V25H27V28H29V29H27V27H25V25H23Z",
    ],
    [
      "M8 22H12V25H15V30H10V28H11V27H8ZM22 22H26V25H24V27H21V30H17V27H20V25H22Z",
      "M9 23H11V26H13V29H12V27H10V26H9ZM23 23H25V24H23V26H21V28H19V29H20V27H22V25H23Z",
    ],
    [
      "M8 22H12V28H14V30H8ZM22 22H26V28H28V30H22Z",
      "M9 23H11V28H12V29H9ZM23 23H25V28H26V29H23Z",
    ],
  ],
  vertical: [
    [
      "M10 22H14V28H16V30H10ZM20 22H24V25H26V27H20Z",
      "M11 23H13V28H14V29H11ZM21 23H23V25H24V26H21Z",
    ],
    [
      "M10 22H14V25H16V27H10ZM20 22H24V28H26V30H20Z",
      "M11 23H13V25H14V26H11ZM21 23H23V28H24V29H21Z",
    ],
    [
      "M10 22H14V28H16V30H10ZM20 22H24V28H26V30H20Z",
      "M11 23H13V28H14V29H11ZM21 23H23V28H24V29H21Z",
    ],
  ],
} as const;
function AnimalLegs({
  view,
  far,
  fur,
  shade,
  pose,
}: {
  view: View;
  far: boolean;
  fur: string;
  shade: string;
  pose: Pose;
}) {
  const vertical = view === "front" || view === "back";
  const frame = pose === "0" ? (far ? 1 : 0) : pose === "1" ? (far ? 0 : 1) : 2;
  const paths = animalFeet[vertical ? "vertical" : "side"][frame];
  return (
    <g transform={far ? "translate(-1 -2)" : undefined}>
      <path d={paths[0]} fill={ink} />
      <path d={paths[1]} fill={far ? shade : fur} />
    </g>
  );
}

function AnimalHead({
  dog,
  view,
  shade,
}: {
  dog: boolean;
  view: View;
  shade: string;
}) {
  const back = view === "back" || view === "away";
  const side = view === "side";
  const diagonal = view === "toward" || view === "away";
  const x = side ? 16 : diagonal ? 12 : 9;
  return (
    <g transform={`translate(${x} 0)`}>
      <path
        d={
          dog
            ? "M3 6H11V8H14V11H15V20H13V22H3V20H1V10H3Z"
            : "M1 3H3V5H5V7H10V5H12V3H14V8H15V20H13V22H3V20H1Z"
        }
        fill={ink}
      />
      <path
        d={
          dog
            ? "M4 7H10V9H13V12H14V19H12V21H4V19H2V11H4Z"
            : "M2 5H3V7H5V8H11V7H13V5H14V19H12V21H4V19H2Z"
        }
        fill={dog ? "#f8d386" : "#ffd3b7"}
      />
      {dog ? (
        <>
          <path d="M1 9H5V11H6V18H4V20H2V18H0V11H1Z" fill={ink} />
          <path d="M2 10H4V12H5V17H3V19H2V17H1V12H2Z" fill={shade} />
          {!side && <path d="M12 9H15V18H13V20H12Z" fill={shade} />}
        </>
      ) : (
        <>
          <path d="M2 7H3V9H5V10H2ZM13 7H14V10H11V9H13Z" fill="#dc8d8b" />
          <path d="M6 8H8V11H6ZM9 8H11V10H9Z" fill={shade} />
        </>
      )}
      {back ? (
        <path d="M6 14H8V18H6ZM9 15H11V19H9Z" fill={shade} />
      ) : (
        <>
          <path
            d={
              side
                ? "M10 16H15V20H11V21H9V18H10Z"
                : "M5 17H12V20H10V21H6V20H4V18H5Z"
            }
            fill={dog ? "#ffe5b0" : "#ffe7d3"}
          />
          <g className={styles.eyes} fill={ink}>
            {!side && <path d="M5 12H7V15H5Z" />}
            <path d="M11 12H13V15H11Z" />
          </g>
          <path
            d={side ? "M13 16H16V18H14V19H13Z" : "M8 17H10V19H8Z"}
            fill={dog ? ink : "#b66674"}
          />
          {!dog && (
            <path
              d="M1 16H4V17H1ZM0 19H4V20H0ZM13 16H16V17H13ZM13 19H16V20H13Z"
              fill={shade}
            />
          )}
        </>
      )}
      {dog && (
        <>
          <path d="M4 22H12V24H4Z" fill="#568da1" />
          <path d="M9 23H11V25H9Z" fill="#f5d56c" />
        </>
      )}
    </g>
  );
}

function Animal({
  kind,
  view,
  pose,
}: {
  kind: "dog" | "cat";
  view: View;
  pose: Pose;
}) {
  const dog = kind === "dog",
    vertical = view === "front" || view === "back";
  const fur = dog ? "#efba5b" : "#fac3a4",
    shade = dog ? "#ad7035" : "#ce8870";
  const head = <AnimalHead dog={dog} view={view} shade={shade} />;
  return (
    <>
      <g>
        <path
          d={
            vertical
              ? "M15 21H18V12H16V10H14V12H16V19H15Z"
              : dog
                ? "M10 20H5V18H3V13H5V16H7V18H10Z"
                : "M10 22H4V20H2V13H4V11H7V13H5V18H7V20H10Z"
          }
          fill={ink}
        />
        <path
          d={vertical ? "M16 13H17V20H16Z" : "M8 20H5V18H4V15H5V17H7V19H9Z"}
          fill={shade}
        />
      </g>
      <AnimalLegs view={view} pose={pose} far fur={fur} shade={shade} />
      <g>
        {view === "away" && head}
        <path
          d={
            vertical
              ? "M10 16H23V18H25V25H23V27H10V25H8V18H10Z"
              : "M9 16H14V14H23V16H26V24H23V26H9V24H7V18H9Z"
          }
          fill={ink}
        />
        <path
          d={
            vertical
              ? "M11 17H22V19H24V24H22V26H11V24H9V19H11Z"
              : "M10 17H15V15H22V17H25V23H22V25H10V23H8V19H10Z"
          }
          fill={fur}
        />
        <path
          d={
            vertical
              ? "M10 23H23V25H21V26H12V25H10Z"
              : "M9 22H15V24H22V25H10V23H9Z"
          }
          fill={shade}
        />
        {!dog && (
          <path
            d={
              vertical
                ? "M12 18H14V21H12ZM19 18H21V21H19Z"
                : "M10 17H12V20H10ZM14 16H16V18H14Z"
            }
            fill={shade}
          />
        )}
      </g>
      <AnimalLegs view={view} pose={pose} far={false} fur={fur} shade={shade} />
      <g>{view !== "away" && head}</g>
    </>
  );
}

function Robot({ view, pose }: { view: View; pose: Pose }) {
  const side = view === "side",
    back = view === "back" || view === "away";
  const left = side ? 12 : 8,
    right = side ? 20 : 23;
  return (
    <>
      <g transform={side ? "translate(3 0)" : undefined} fill="#354356">
        <path
          d={
            pose === "0"
              ? "M10 24H15V27H12V29H8V31H5V28H9V26H10ZM19 24H24V27H26V29H29V31H23V28H21V26H19Z"
              : pose === "1"
                ? "M10 24H15V27H17V31H11V29H12V27H10ZM19 24H24V27H21V29H18V31H14V28H18V26H19Z"
                : "M10 24H15V29H17V31H10ZM19 24H24V29H26V31H19Z"
          }
        />
        <path
          d={
            pose === "0"
              ? "M11 25H14V26H11V28H10V29H7V30H9V28H11ZM20 25H23V27H25V30H24V28H22V26H20Z"
              : pose === "1"
                ? "M11 25H14V27H16V30H13V29H14V27H11ZM20 25H23V26H20V28H19V29H16V30H17V28H20Z"
                : "M11 25H14V29H15V30H11ZM20 25H23V29H24V30H20Z"
          }
          fill="#b8cfdf"
        />
        <path
          d={
            pose === "0"
              ? "M6 19H10V23H8V25H4V22H6ZM23 19H27V23H30V26H26V24H23Z"
              : pose === "1"
                ? "M6 19H10V23H13V26H9V24H6ZM23 19H27V23H25V25H21V22H23Z"
                : "M6 19H10V26H6ZM23 19H27V26H23Z"
          }
        />
      </g>
      <g>
        <path d={`M${left} 19H${right}V26H${left}Z`} fill="#354356" />
        <path
          d={`M${left + 1} 20H${right - 1}V25H${left + 1}Z`}
          fill="#7795b2"
        />
        <path d="M15 23H18V25H15Z" fill="#f5bc59" />
        <g transform={side ? "translate(7 0)" : undefined}>
          <path
            d={
              side
                ? "M7 6H18V8H20V20H18V22H7V20H5V8H7Z"
                : "M7 6H25V8H27V20H25V22H7V20H5V8H7Z"
            }
            fill="#354356"
          />
          <path
            d={
              side
                ? "M8 7H17V9H19V19H17V21H8V19H6V9H8Z"
                : "M8 7H24V9H26V19H24V21H8V19H6V9H8Z"
            }
            fill="#b8cfdf"
          />
          <path d="M15 2H17V6H15Z" fill="#354356" />
          <path d="M14 1H18V4H14Z" fill="#f5bc59" />
          {back ? (
            <>
              <path
                d={
                  view === "away"
                    ? "M13 11H24V12H13ZM13 14H24V15H13ZM13 17H24V18H13Z"
                    : "M10 11H21V12H10ZM10 14H21V15H10ZM10 17H21V18H10Z"
                }
                fill="#7795b2"
              />
              {view === "away" && <path d="M8 9H11V19H8Z" fill="#7795b2" />}
            </>
          ) : (
            <>
              <path
                d={
                  side
                    ? "M13 10H19V18H13Z"
                    : view === "toward"
                      ? "M12 10H25V18H12Z"
                      : "M8 10H24V18H8Z"
                }
                fill="#273b51"
              />
              <g className={styles.eyes} fill="#9cf0dc">
                {!side && (
                  <path
                    d={
                      view === "toward"
                        ? "M14 13H17V16H14Z"
                        : "M10 13H13V16H10Z"
                    }
                  />
                )}
                <path d={side ? "M16 13H18V16H16Z" : "M20 13H23V16H20Z"} />
              </g>
              <path d="M14 19H20V20H14Z" fill="#354356" />
            </>
          )}
          <path d="M6 12H8V17H6Z" fill="#7795b2" />
        </g>
      </g>
    </>
  );
}

function Ghost({ view, pose }: { view: View; pose: Pose }) {
  const back = view === "back" || view === "away",
    side = view === "side";
  return (
    <>
      <g>
        <path
          d={
            pose === "0"
              ? "M7 18H26V24H28V29H24V27H22V31H19V28H16V30H12V27H8V25H3V27H1V22H7Z"
              : pose === "1"
                ? "M7 18H26V24H29V27H25V30H22V28H19V31H15V28H11V30H7V26H2V23H7Z"
                : "M7 18H26V24H28V28H25V27H23V31H20V28H17V30H14V27H11V29H8V25H4V26H2V22H7Z"
          }
          fill="#21202e"
        />
        <path
          d={
            pose === "0"
              ? "M8 19H25V24H26V27H25V25H21V29H20V26H15V28H13V25H9V23H4V24H3V23H8Z"
              : pose === "1"
                ? "M8 19H25V24H27V26H24V28H23V26H18V29H16V26H10V28H8V24H4V23H8Z"
                : "M8 19H25V24H26V26H24V25H22V29H21V26H16V28H15V25H10V27H9V23H5V24H4V22H8Z"
          }
          fill="#515565"
        />
        <path d="M7 22H9V25H7ZM23 22H25V26H23Z" fill="#858b96" />
      </g>
      <g>
        <path
          d="M12 2H22V4H26V7H28V12H29V21H26V24H8V22H5V14H6V9H8V5H12Z"
          fill="#21202e"
        />
        <path
          d="M12 3H21V5H25V8H27V14H28V20H25V23H9V21H6V15H7V10H9V6H12Z"
          fill="#515565"
        />
        {back ? (
          <path
            d={
              view === "away"
                ? "M15 8H17V21H15ZM23 9H25V22H23ZM9 12H11V20H9Z"
                : "M12 8H14V21H12ZM20 7H22V22H20Z"
            }
            fill="#676d7d"
          />
        ) : side ? (
          <>
            <path
              d="M19 7H24V9H26V12H27V20H25V23H24V26H20V23H18V20H17V12H18V9H19Z"
              fill="#d4dcc7"
            />
            <path
              d="M23 12H26V17H23ZM24 19H27V21H24ZM20 22H25V25H24V27H21V25H20Z"
              fill="#250d1a"
            />
            <path className={styles.eyes} d="M24 14H26V16H24Z" fill="#ff1746" />
            <path
              d="M21 22H22V24H21ZM23 22H24V24H23ZM22 25H23V27H22Z"
              fill="#edf0da"
            />
          </>
        ) : (
          <g transform={view === "toward" ? "translate(4 0)" : undefined}>
            <path
              d="M11 7H22V9H25V12H26V20H23V23H21V26H13V23H10V20H8V12H9V9H11Z"
              fill="#d4dcc7"
            />
            <path
              d="M10 11H14V13H16V18H11V16H10ZM19 13H21V11H25V16H24V18H19Z"
              fill="#250d1a"
            />
            <g className={styles.eyes} fill="#ff1746">
              <path d="M11 14H14V16H12V15H11ZM21 14H24V15H23V16H21Z" />
            </g>
            <path
              d="M16 18H18V20H19V21H15V20H16ZM12 22H22V25H21V27H13V25H12Z"
              fill="#211d2a"
            />
            <path
              d="M13 22H14V24H13ZM16 22H17V24H16ZM19 22H20V24H19ZM14 25H15V27H14ZM18 25H19V27H18Z"
              fill="#edf0da"
            />
          </g>
        )}
      </g>
    </>
  );
}

function IdleDetail({ kind, pose }: { kind: Kind; pose: Pose }) {
  if (pose === "alert")
    return (
      <path
        d="M3 1H5V6H3ZM3 8H5V10H3Z"
        fill={kind === "ghost" ? "#ff1746" : "#f5bc59"}
      />
    );
  if (pose === "look") return <path d="M1 11H4V12H1ZM2 8H5V9H2Z" fill={ink} />;
  if (pose === "groom") {
    if (kind === "dog")
      return (
        <>
          <path d="M8 25H12V22H15V16H18V20H16V25H13V28H8Z" fill={ink} />
          <path
            d="M10 26H12V24H15V21H16V18H17V20H15V24H13V27H10Z"
            fill="#efba5b"
          />
          <path d="M12 10H14V12H12ZM10 13H12V14H10Z" fill="#ad7035" />
        </>
      );
    if (kind === "cat")
      return (
        <>
          <path d="M22 24H27V18H30V26H28V29H22Z" fill={ink} />
          <path d="M23 25H28V20H29V25H27V28H23Z" fill="#fac3a4" />
          <path d="M27 19H30V21H27Z" fill="#dc8d8b" />
        </>
      );
    if (kind === "robot")
      return (
        <>
          <path d="M6 20H14V26H6Z" fill="#354356" />
          <path d="M7 21H13V25H7Z" fill="#9cf0dc" />
          <path d="M9 22H11V24H9Z" fill="#f5bc59" />
        </>
      );
    return (
      <>
        <path
          d="M4 19H9V22H5V25H1V22H3ZM25 20H29V23H31V26H27V24H25Z"
          fill="#21202e"
        />
        <path
          d="M4 21H8V22H4V24H3V22H4ZM27 22H28V24H30V25H28V23H27Z"
          fill="#858b96"
        />
      </>
    );
  }
  if (pose === "tired")
    return <path d="M2 6H5V7H2ZM1 9H4V10H1Z" fill="#858b96" />;
  if (pose.startsWith("sleep"))
    return (
      <g transform={pose === "sleep1" ? "translate(0 -1)" : undefined}>
        <path
          d="M2 3H7V4H5V5H3V6H7V7H2V5H4V4H2Z"
          fill={kind === "robot" ? "#9cf0dc" : "#858b96"}
        />
        {kind === "robot" && <path d="M14 23H18V24H14Z" fill="#9cf0dc" />}
      </g>
    );
  return null;
}

// /** Original integer-grid poses; west-facing views mirror east-facing art. */
// export function Character({ kind }: { kind: Kind }) {
//   if (kind === "f1") {
//     const NAVY = "#2447b8"; // brighter than before so it shows on black
//     const NAVY_DK = "#142a78";
//     const RED = "#e10b24";
//     const YEL = "#ffc906";
//     const INK = "#070a1c";
//     return (
//       <svg
//         viewBox="0 0 62 32"
//         width="68"
//         height="35"
//         aria-hidden="true"
//         className={styles.character}
//       >
//         {/* Ground shadow */}
//         <ellipse cx="32" cy="29" rx="28" ry="1.3" fill="#000" opacity=".35" />

//         {/* Rear wing */}
//         <path d="M10 16.5V23" stroke={INK} strokeWidth="1.6" />
//         <path
//           d="M2 5.5h9.5l.6 2.6-1.1 8.6H3.4z"
//           fill={NAVY_DK}
//           stroke="#6f8ae0"
//           strokeWidth=".6"
//         />
//         <path d="M2.6 5.2h9.2" stroke={RED} strokeWidth="1.5" />
//         <path d="M3.4 9h8M3.8 12h7.4" stroke="#6f8ae0" strokeWidth=".5" />
//         <path d="M4 7.2h2.4" stroke={YEL} strokeWidth="1" />

//         {/* Far-side tyres */}
//         <circle cx="17" cy="20.5" r="6.3" fill="#0b0c12" />
//         <circle cx="48.4" cy="22" r="5" fill="#0b0c12" />

//         {/* Suspension */}
//         <path
//           d="M15 22l8-2.5M47 23.5l-8-3"
//           stroke="#2a3150"
//           strokeWidth="1.1"
//         />

//         {/* Main body */}
//         <path
//           d="M8 22.5 11 17l10-4.5.8-4.5h6.4l1.3 5.5 1.7 1.5 7 1 6 2.5 13 5v2.2l-7 1.3H8z"
//           fill={NAVY}
//           stroke="#7f98ea"
//           strokeWidth=".6"
//         />
//         {/* Upper highlight */}
//         <path
//           d="M12 17.2 21.4 13l.8-4.4"
//           fill="none"
//           stroke="#8fa8ff"
//           strokeWidth=".6"
//           opacity=".7"
//         />
//         {/* Airbox */}
//         <path d="M22.6 8.4h5l.5 3h-5.8z" fill={INK} />
//         <path d="M22.2 8h6" stroke={RED} strokeWidth=".9" />
//         {/* Engine cover stripe */}
//         <path
//           d="M11.5 17.6 21 13.6"
//           stroke={RED}
//           strokeWidth="1.8"
//           strokeLinecap="round"
//         />

//         {/* Sidepod */}
//         <path
//           d="M22 19.2 31 16.3l9.5 1.4 2.3 3.8-2.3 4-17 .6z"
//           fill={RED}
//           stroke="#ff6b7d"
//           strokeWidth=".5"
//         />
//         <path d="M36 17.6l4.4.5 1.6 3-5-.4z" fill={INK} />
//         <path
//           d="M24 20.5 31 18.6"
//           stroke="#ffb3bc"
//           strokeWidth=".7"
//           opacity=".8"
//         />

//         {/* Yellow sun disc + stripes */}
//         <circle cx="19.5" cy="20.6" r="1.7" fill={YEL} />
//         <path d="M9 24.6h42" stroke={YEL} strokeWidth="1" />
//         <path d="M50.5 21.9l5.4 2.1" stroke={YEL} strokeWidth="1.4" />

//         {/* Helmet + halo */}
//         <circle
//           cx="33.3"
//           cy="13"
//           r="2.4"
//           fill={YEL}
//           stroke="#7a5f00"
//           strokeWidth=".4"
//         />
//         <path d="M33.7 12h2.3v1.7h-2.4z" fill="#0b1020" />
//         <path
//           d="M30.4 15.2 33.6 11l5.2 3.6"
//           fill="none"
//           stroke="#e3e8f2"
//           strokeWidth=".9"
//           strokeLinejoin="round"
//         />
//         <path d="M38.8 14.6l.8 2" stroke="#e3e8f2" strokeWidth=".9" />

//         {/* Front wing */}
//         <path
//           d="M46 26.2h13.5l1.2 2.1H45z"
//           fill={RED}
//           stroke="#ff6b7d"
//           strokeWidth=".5"
//         />
//         <path
//           d="M58.4 24.2h2.6v5h-2.6z"
//           fill={NAVY_DK}
//           stroke="#6f8ae0"
//           strokeWidth=".5"
//         />
//         <path d="M58.8 25h1.8" stroke={YEL} strokeWidth=".9" />

//         {/* Near-side wheels */}
//         <g className={styles.carWheel}>
//           <circle
//             cx="15"
//             cy="22"
//             r="6.5"
//             fill="#12141c"
//             stroke="#3a3f52"
//             strokeWidth=".8"
//           />
//           <circle
//             cx="15"
//             cy="22"
//             r="5.3"
//             fill="none"
//             stroke={RED}
//             strokeWidth=".7"
//           />
//           <circle cx="15" cy="22" r="3.6" fill="#1b1f2a" />
//           <circle cx="15" cy="22" r="2.6" fill="#b7bfcb" />
//           <path
//             d="M12.6 22h4.8M15 19.6v4.8M13.3 20.3l3.4 3.4M16.7 20.3l-3.4 3.4"
//             stroke="#4a515c"
//             strokeWidth=".6"
//           />
//           <circle cx="15" cy="22" r=".7" fill="#2a2f39" />
//         </g>
//         <g className={styles.carWheel}>
//           <circle
//             cx="47"
//             cy="23.5"
//             r="5.2"
//             fill="#12141c"
//             stroke="#3a3f52"
//             strokeWidth=".8"
//           />
//           <circle
//             cx="47"
//             cy="23.5"
//             r="4.2"
//             fill="none"
//             stroke={RED}
//             strokeWidth=".6"
//           />
//           <circle cx="47" cy="23.5" r="2.9" fill="#1b1f2a" />
//           <circle cx="47" cy="23.5" r="2.1" fill="#b7bfcb" />
//           <path
//             d="M45.1 23.5h3.8M47 21.6v3.8M45.6 22.1l2.8 2.8M48.4 22.1l-2.8 2.8"
//             stroke="#4a515c"
//             strokeWidth=".5"
//           />
//           <circle cx="47" cy="23.5" r=".6" fill="#2a2f39" />
//         </g>
//       </svg>
//     );
//   }

//   return (
//     <svg
//       viewBox="0 0 32 32"
//       width="40"
//       height="40"
//       fill="none"
//       shapeRendering="crispEdges"
//       aria-hidden="true"
//       className={styles.character}
//       data-kind={kind}
//     >
//       {views.map((view) => (
//         <g key={view} data-view={view} className={styles.view}>
//           {poses.map((pose) => (
//             <g key={pose} data-pose={pose} className={styles.pose}>
//               <g
//                 transform={
//                   pose === "sleep0"
//                     ? "translate(0 1)"
//                     : pose === "sleep1"
//                       ? "translate(0 2)"
//                       : undefined
//                 }
//               >
//                 {kind === "dog" || kind === "cat" ? (
//                   <Animal kind={kind} view={view} pose={pose} />
//                 ) : kind === "robot" ? (
//                   <Robot view={view} pose={pose} />
//                 ) : (
//                   <Ghost view={view} pose={pose} />
//                 )}
//               </g>
//               <IdleDetail kind={kind} pose={pose} />
//             </g>
//           ))}
//         </g>
//       ))}
//     </svg>
//   );
// }

// //   if (kind === "f1")
// //     return (
// //       <svg
// //         viewBox="0 0 62 32"
// //         width="68"
// //         height="35"
// //         aria-hidden="true"
// //         className={styles.character}
// //       >
// //         <defs>
// //           <linearGradient id="rb-navy" x1="0" x2="0" y1="0" y2="1">
// //             <stop stopColor="#2b3f8f" />
// //             <stop offset=".5" stopColor="#17265e" />
// //             <stop offset="1" stopColor="#0a1233" />
// //           </linearGradient>
// //           <linearGradient id="rb-red" x1="0" x2="0" y1="0" y2="1">
// //             <stop stopColor="#ff2a45" />
// //             <stop offset=".6" stopColor="#d3001c" />
// //             <stop offset="1" stopColor="#8a0014" />
// //           </linearGradient>
// //         </defs>

// //         {/* Ground shadow */}
// //         <ellipse cx="32" cy="29" rx="28" ry="1.3" fill="#000" opacity=".35" />

// //         {/* Rear wing: endplate, flaps, pillar */}
// //         <path d="M10 16.5V23" stroke="#0a1233" strokeWidth="1.6" />
// //         <path
// //           d="M2 5.5h9.5l.6 2.6-1.1 8.6H3.4z"
// //           fill="url(#rb-navy)"
// //           stroke="#060a1c"
// //           strokeWidth=".7"
// //         />
// //         <path d="M2.6 5.2h9.2" stroke="url(#rb-red)" strokeWidth="1.5" />
// //         <path d="M3.4 9h8M3.8 12h7.4" stroke="#060a1c" strokeWidth=".6" />
// //         <path d="M4 7.2h2.4" stroke="#ffc906" strokeWidth="1" />

// //         {/* Far-side tyres (static, darker, offset for depth) */}
// //         <circle cx="17" cy="20.5" r="6.3" fill="#07080c" />
// //         <circle cx="48.4" cy="22" r="5" fill="#07080c" />

// //         {/* Suspension arms */}
// //         <path
// //           d="M15 22l8-2.5M47 23.5l-8-3"
// //           stroke="#0a0d18"
// //           strokeWidth="1.1"
// //         />

// //         {/* Main body: engine cover, airbox, cockpit, nose */}
// //         <path
// //           d="M8 22.5 11 17l10-4.5.8-4.5h6.4l1.3 5.5 1.7 1.5 7 1 6 2.5 13 5v2.2l-7 1.3H8z"
// //           fill="url(#rb-navy)"
// //           stroke="#060a1c"
// //           strokeWidth=".8"
// //         />
// //         {/* Airbox intake */}
// //         <path d="M22.6 8.4h5l.5 3h-5.8z" fill="#05081a" />
// //         <path d="M22.2 8h6" stroke="#ff2a45" strokeWidth=".9" />
// //         {/* Engine cover red stripe */}
// //         <path
// //           d="M11.5 17.6 21 13.6"
// //           stroke="url(#rb-red)"
// //           strokeWidth="1.8"
// //
//   return (
//     <svg
//       viewBox="0 0 32 32"
//       width="40"
//       height="40"
//       fill="none"
//       shapeRendering="crispEdges"
//       aria-hidden="true"
//       className={styles.character}
//       data-kind={kind}
//     >
//       {views.map((view) => (
//         <g key={view} data-view={view} className={styles.view}>
//           {poses.map((pose) => (
//             <g key={pose} data-pose={pose} className={styles.pose}>
//               <g
//                 transform={
//                   pose === "sleep0"
//                     ? "translate(0 1)"
//                     : pose === "sleep1"
//                       ? "translate(0 2)"
//                       : undefined
//                 }
//               >
//                 {kind === "dog" || kind === "cat" ? (
//                   <Animal kind={kind} view={view} pose={pose} />
//                 ) : kind === "robot" ? (
//                   <Robot view={view} pose={pose} />
//                 ) : (
//                   <Ghost view={view} pose={pose} />
//                 )}
//               </g>
//               <IdleDetail kind={kind} pose={pose} />
//             </g>
//           ))}
//         </g>
//       ))}
//     </svg>
//   );
// }

/** Original integer-grid poses; west-facing views mirror east-facing art. */
export function Character({ kind }: { kind: Kind }) {
  if (kind === "f1") {
    const NAVY = "#2447b8";
    const NAVY_DK = "#142a78";
    const RED = "#e10b24";
    const YEL = "#ffc906";
    const INK = "#070a1c";

    return (
      <svg
        viewBox="0 0 62 32"
        width="68"
        height="35"
        aria-hidden="true"
        className={styles.character}
      >
        {/* Ground shadow */}
        <ellipse cx="32" cy="29" rx="28" ry="1.3" fill="#000" opacity=".35" />

        {/* Rear wing */}
        <path d="M10 16.5V23" stroke={INK} strokeWidth="1.6" />

        <path
          d="M2 5.5h9.5l.6 2.6-1.1 8.6H3.4z"
          fill={NAVY_DK}
          stroke="#6f8ae0"
          strokeWidth=".6"
        />

        <path d="M2.6 5.2h9.2" stroke={RED} strokeWidth="1.5" />

        <path d="M3.4 9h8M3.8 12h7.4" stroke="#6f8ae0" strokeWidth=".5" />

        <path d="M4 7.2h2.4" stroke={YEL} strokeWidth="1" />

        {/* Far-side tyres */}
        <circle cx="17" cy="20.5" r="6.3" fill="#0b0c12" />

        <circle cx="48.4" cy="22" r="5" fill="#0b0c12" />

        {/* Suspension */}
        <path
          d="M15 22l8-2.5M47 23.5l-8-3"
          stroke="#2a3150"
          strokeWidth="1.1"
        />

        {/* Main body */}
        <path
          d="M8 22.5 11 17l10-4.5.8-4.5h6.4l1.3 5.5 1.7 1.5 7 1 6 2.5 13 5v2.2l-7 1.3H8z"
          fill={NAVY}
          stroke="#7f98ea"
          strokeWidth=".6"
        />

        {/* Upper highlight */}
        <path
          d="M12 17.2 21.4 13l.8-4.4"
          fill="none"
          stroke="#8fa8ff"
          strokeWidth=".6"
          opacity=".7"
        />

        {/* Airbox */}
        <path d="M22.6 8.4h5l.5 3h-5.8z" fill={INK} />

        <path d="M22.2 8h6" stroke={RED} strokeWidth=".9" />

        {/* Engine cover stripe */}
        <path
          d="M11.5 17.6 21 13.6"
          stroke={RED}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Sidepod */}
        <path
          d="M22 19.2 31 16.3l9.5 1.4 2.3 3.8-2.3 4-17 .6z"
          fill={RED}
          stroke="#ff6b7d"
          strokeWidth=".5"
        />

        <path d="M36 17.6l4.4.5 1.6 3-5-.4z" fill={INK} />

        <path
          d="M24 20.5 31 18.6"
          stroke="#ffb3bc"
          strokeWidth=".7"
          opacity=".8"
        />

        {/* Yellow sun disc + stripes */}
        <circle cx="19.5" cy="20.6" r="1.7" fill={YEL} />

        <path d="M9 24.6h42" stroke={YEL} strokeWidth="1" />

        <path d="M50.5 21.9l5.4 2.1" stroke={YEL} strokeWidth="1.4" />

        {/* Helmet + halo */}
        <circle
          cx="33.3"
          cy="13"
          r="2.4"
          fill={YEL}
          stroke="#7a5f00"
          strokeWidth=".4"
        />

        <path d="M33.7 12h2.3v1.7h-2.4z" fill="#0b1020" />

        <path
          d="M30.4 15.2 33.6 11l5.2 3.6"
          fill="none"
          stroke="#e3e8f2"
          strokeWidth=".9"
          strokeLinejoin="round"
        />

        <path d="M38.8 14.6l.8 2" stroke="#e3e8f2" strokeWidth=".9" />

        {/* Front wing */}
        <path
          d="M46 26.2h13.5l1.2 2.1H45z"
          fill={RED}
          stroke="#ff6b7d"
          strokeWidth=".5"
        />

        <path
          d="M58.4 24.2h2.6v5h-2.6z"
          fill={NAVY_DK}
          stroke="#6f8ae0"
          strokeWidth=".5"
        />

        <path d="M58.8 25h1.8" stroke={YEL} strokeWidth=".9" />

        {/* Near-side rear wheel */}
        <g className={styles.carWheel}>
          <circle
            cx="15"
            cy="22"
            r="6.5"
            fill="#12141c"
            stroke="#3a3f52"
            strokeWidth=".8"
          />

          <circle
            cx="15"
            cy="22"
            r="5.3"
            fill="none"
            stroke={RED}
            strokeWidth=".7"
          />

          <circle cx="15" cy="22" r="3.6" fill="#1b1f2a" />

          <circle cx="15" cy="22" r="2.6" fill="#b7bfcb" />

          <path
            d="M12.6 22h4.8M15 19.6v4.8M13.3 20.3l3.4 3.4M16.7 20.3l-3.4 3.4"
            stroke="#4a515c"
            strokeWidth=".6"
          />

          <circle cx="15" cy="22" r=".7" fill="#2a2f39" />
        </g>

        {/* Near-side front wheel */}
        <g className={styles.carWheel}>
          <circle
            cx="47"
            cy="23.5"
            r="5.2"
            fill="#12141c"
            stroke="#3a3f52"
            strokeWidth=".8"
          />

          <circle
            cx="47"
            cy="23.5"
            r="4.2"
            fill="none"
            stroke={RED}
            strokeWidth=".6"
          />

          <circle cx="47" cy="23.5" r="2.9" fill="#1b1f2a" />

          <circle cx="47" cy="23.5" r="2.1" fill="#b7bfcb" />

          <path
            d="M45.1 23.5h3.8M47 21.6v3.8M45.6 22.1l2.8 2.8M48.4 22.1l-2.8 2.8"
            stroke="#4a515c"
            strokeWidth=".5"
          />

          <circle cx="47" cy="23.5" r=".6" fill="#2a2f39" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      width="40"
      height="40"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={styles.character}
      data-kind={kind}
    >
      {views.map((view) => (
        <g key={view} data-view={view} className={styles.view}>
          {poses.map((pose) => (
            <g key={pose} data-pose={pose} className={styles.pose}>
              <g
                transform={
                  pose === "sleep0"
                    ? "translate(0 1)"
                    : pose === "sleep1"
                      ? "translate(0 2)"
                      : undefined
                }
              >
                {kind === "dog" || kind === "cat" ? (
                  <Animal kind={kind} view={view} pose={pose} />
                ) : kind === "robot" ? (
                  <Robot view={view} pose={pose} />
                ) : (
                  <Ghost view={view} pose={pose} />
                )}
              </g>

              <IdleDetail kind={kind} pose={pose} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
