export const defaultExams = [
  {
    id: "exam-xsoar-official-samples",
    title: "Palo Alto Networks Cortex XSOAR Engineer (PCSAE) Official Practice Exam",
    category: "Cortex XSOAR",
    description: "แบบทดสอบวัดระดับเตรียมความพร้อมการสอบรับรองวิศวกร XSOAR (PCSAE) ประกอบด้วยโจทย์จริงแนวข้อสอบจาก Palo Alto Networks พร้อมเฉลยคำแปลไทยใต้โจทย์และรองรับคำตอบแบบเลือกหลายข้อ (Multi-Choice)",
    timeLimit: 15,
    passPercentage: 70,
    questions: [
      {
        id: "pcsae-01",
        text: "When planning a Cortex XSOAR engine deployment, which factor is most important?\n(แปลไทย: เมื่อวางแผนการติดตั้งใช้งาน Cortex XSOAR engine ปัจจัยใดสำคัญที่สุด?)",
        type: "single-choice",
        options: [
          "Ensuring the engine is installed on the same host as Elasticsearch",
          "Placing the engine close to integrations requiring network access",
          "Using the largest available hardware instance",
          "Ensuring the engine uses HTTPS for marketplace sync"
        ],
        correctAnswer: 1,
        explanation: "การวาง Cortex XSOAR Engine ควรวางไว้ใกล้กับระบบเป้าหมายที่ต้องการเข้าถึงเครือข่าย เพื่อให้สามารถเชื่อมต่อแบบโลคอลและลดความล่าช้าในการส่งผ่านคำสั่ง (Network Latency)"
      },
      {
        id: "pcsae-02",
        text: "Which two tasks are essential when planning a dev/prod XSOAR deployment?\n(Choose two)\n(แปลไทย: ข้อใดคืองานที่จำเป็นในการวางแผนการติดตั้งใช้งาน XSOAR แบบสภาพแวดล้อม Dev/Prod? (เลือก 2 คำตอบ))",
        type: "multi-choice",
        options: [
          "Automatically syncing credentials between environments",
          "Ensuring Elasticsearch clusters are identical versions",
          "Establishing a content promotion workflow for packs",
          "Mapping pack dependencies to avoid execution gaps",
          "Disabling mappers in dev to avoid conflicts"
        ],
        correctAnswer: [2, 3],
        explanation: "การวางแผน Dev/Prod ต้องมีการกำหนดกระบวนการโปรโมต Content Pack (Content Promotion Workflow) และการแมปความขึ้นต่อกันของแพ็ค (Pack Dependencies) เพื่อป้องกันการสะดุดของการรันคำสั่งเมื่อโอนย้ายระบบ"
      },
      {
        id: "pcsae-03",
        text: "An engineer needs to reference a deeply nested value in a JSON object. Which element enables this?\n(แปลไทย: วิศวกรต้องการอ้างอิงค่าที่ซ้อนทับอยู่ภายในลึก ๆ ของออบเจกต์ JSON องค์ประกอบใดที่ช่วยให้ทำเช่นนั้นได้?)",
        type: "single-choice",
        options: [
          "Dot-notation context paths",
          "List filtering",
          "Field normalization",
          "Pre-processing script"
        ],
        correctAnswer: 0,
        explanation: "ในคีย์ข้อมูล Context ของ Cortex XSOAR จะใช้สัญลักษณ์จุด (Dot-notation) ในการระบุและเข้าถึงโครงสร้างข้อมูล JSON ที่ซ้อนทับกันหลายชั้น เช่น Endpoint.Details.IP"
      },
      {
        id: "pcsae-04",
        text: "Which two enrichment steps can be performed using built-in threat intelligence commands?\n(Choose two)\n(แปลไทย: ขั้นตอนการเพิ่มข้อมูลภัยคุกคาม (Enrichment) ใดต่อไปนี้สามารถทำได้โดยใช้คำสั่ง Threat Intelligence ในตัว? (เลือก 2 คำตอบ))",
        type: "multi-choice",
        options: [
          "Calculate malware family",
          "Retrieve WHOIS data",
          "Identify duplicate layouts",
          "Extract user roles",
          "Query URL reputation"
        ],
        correctAnswer: [1, 4],
        explanation: "การใช้คำสั่งตรวจภัยคุกคามแบบ Built-in (เช่น IP/URL Reputation) สามารถสืบค้นข้อมูล WHOIS และค่าความน่าเชื่อถือเรตติ้งของโดเมน/URL ได้ทันที"
      },
      {
        id: "pcsae-05",
        text: "A task must repeat every hour until a threat score drops below 20. Which feature supports this?\n(แปลไทย: งาน (Task) หนึ่งต้องทำซ้ำทุกชั่วโมงจนกว่าคะแนนภัยคุกคามจะลดลงต่ำกว่า 20 ฟีเจอร์ใดที่รองรับการทำแบบนี้?)",
        type: "single-choice",
        options: [
          "Scheduled jobs",
          "Built-in enrichment script",
          "Task SLA",
          "Loop with “until” condition"
        ],
        correctAnswer: 3,
        explanation: "Playbook Tasks ใน XSOAR สามารถตั้งค่าการวนลูป (Looping) โดยกำหนดเงื่อนไขการหลุดจากลูป (Until condition) เช่น วนลูปทำงานไปเรื่อย ๆ จนกระทั่งระดับความเสี่ยงต่ำกว่าเกณฑ์"
      },
      {
        id: "pcsae-06",
        text: "What is the purpose of the playbook debugger during development?\n(แปลไทย: วัตถุประสงค์ของ Playbook Debugger ในระหว่างการพัฒนาคืออะไร?)",
        type: "single-choice",
        options: [
          "To generate synthetic incidents for load testing",
          "To compare script versions in Marketplace packs",
          "To debug integration instances",
          "To step through each playbook task, reviewing context changes"
        ],
        correctAnswer: 3,
        explanation: "Playbook Debugger ช่วยให้นักพัฒนาสามารถรันเพลย์บุ๊กทีละสเต็ป (Step-through) เพื่อตรวจดูการเปลี่ยนแปลงของค่าข้อมูล Context ในแต่ละภารกิจย่อยได้"
      },
      {
        id: "pcsae-07",
        text: "Which two relationships are commonly auto-generated during indicator enrichment?\n(Choose two)\n(แปลไทย: ความสัมพันธ์คู่ใดที่มักจะถูกสร้างขึ้นโดยอัตโนมัติในระหว่างการเพิ่มข้อมูล Indicator (Indicator Enrichment)? (เลือก 2 คำตอบ))",
        type: "multi-choice",
        options: [
          "IP → Domain",
          "URL → Incident Owner",
          "File Hash → Malware Family",
          "Role → Dashboard Widget",
          "Playbook → Indicator"
        ],
        correctAnswer: [0, 2],
        explanation: "การค้นหาข้อมูลภัยคุกคามขั้นลึก (Indicator Enrichment) มักเชื่อมโยงจับคู่ความสัมพันธ์ของ Indicators อัตโนมัติ เช่น ความสัมพันธ์ระหว่างหมายเลขไอพีกับชื่อโดเมนหลัก (IP -> Domain) หรือ ลายเซ็นไฟล์กับกลุ่มมัลแวร์ (File Hash -> Malware Family)"
      },
      {
        id: "pcsae-08",
        text: "A SOC wants to store custom watchlist values used across playbooks. Which XSOAR feature supports this?\n(แปลไทย: SOC ต้องการจัดเก็บค่า Watchlist แบบกำหนดเองเพื่อนำไปใช้ร่วมกันใน Playbooks ต่าง ๆ ฟีเจอร์ใดของ XSOAR ที่รองรับความต้องการนี้?)",
        type: "single-choice",
        options: [
          "Jobs",
          "Lists",
          "Classifiers",
          "Sub-playbooks"
        ],
        correctAnswer: 1,
        explanation: "ฟังก์ชัน XSOAR Lists ช่วยให้ SOC สามารถอัปโหลดข้อมูลส่วนกลาง (เช่น บัญชีรายชื่อห้ามเข้า/Watchlists หรือค่าตัวแปรรันระบบ) เพื่อนำไปเรียกใช้อ้างอิงร่วมกันได้ในทุก ๆ เพลย์บุ๊ก"
      },
      {
        id: "pcsae-09",
        text: "Which two actions can be performed using filters and transformers within a playbook task?\n(Choose two)\n(แปลไทย: การดำเนินการใดที่สามารถทำได้โดยใช้ Filters และ Transformers ภายใน Playbook Task? (เลือก 2 คำตอบ))",
        type: "multi-choice",
        options: [
          "Remove null values from a list",
          "Map external fields to internal incident fields",
          "Convert all strings in a list to lowercase",
          "Configure incident-level permissions",
          "Define job recurrence"
        ],
        correctAnswer: [0, 2],
        explanation: "Filters และ Transformers มีหน้าที่จัดการแปลงค่าผลลัพธ์ข้อมูล เช่น การดึงค่าว่างหรือ Null ออกจากรายการ (Remove null) หรือปรับแต่งฟอร์แมตตัวอักษรให้เป็นพิมพ์เล็กทั้งหมด (Lowercase)"
      },
      {
        id: "pcsae-10",
        text: "If analysts want to remove sensitive command outputs from a final report, which action should be performed?\n(แปลไทย: หากนักวิเคราะห์ต้องการลบผลลัพธ์ของคำสั่งที่ละเอียดอ่อนออกจากรายงานสรุปผลการสอบสวน ควรดำเนินการตามข้อใด?)",
        type: "single-choice",
        options: [
          "Delete the incident",
          "Hide entries using “Mark as non-evidence”",
          "Remove all dashboards",
          "Disable SLA timers"
        ],
        correctAnswer: 1,
        explanation: "การทำเครื่องหมายข้อมูลเป็น 'Mark as non-evidence' จะซ่อนข้อมูลผลลัพธ์ของคำสั่งหรือหลักฐานนั้นออกจากการสรุปผลรายงาน เพื่อป้องกันข้อมูลสปอยล์หรือข้อมูลอ่อนไหว (Sensitive Data) หลุดรอดไป"
      }
    ]
  },
  {
    id: "exam-js-basics",
    title: "JavaScript Basics Quiz",
    category: "JavaScript",
    description: "ทดสอบความรู้พื้นฐานเกี่ยวกับ JavaScript รวมถึงตัวแปร ขอบเขต (Scope) และฟังก์ชัน",
    timeLimit: 10, // 10 minutes
    passPercentage: 70,
    questions: [
      {
        id: "js-q1",
        text: "ข้อใดอธิบายความแตกต่างระหว่าง 'let' และ 'var' ใน JavaScript ได้ถูกต้องที่สุด?",
        type: "single-choice",
        options: [
          "var มีขอบเขตเป็น Block scope ส่วน let มีขอบเขตเป็น Function scope",
          "let มีขอบเขตเป็น Block scope ส่วน var มีขอบเขตเป็น Function scope",
          "var ไม่สามารถถูกเปลี่ยนค่าได้หลังจากประกาศตัวแปรแล้ว",
          "let ไม่เกิดพฤติกรรม Hoisting แต่ var เกิด Hoisting"
        ],
        correctAnswer: 1,
        explanation: "ตัวแปรที่ประกาศด้วย 'let' จะทำงานเฉพาะในบล็อกสัญลักษณ์ปีกกา {...} (Block Scope) ในขณะที่ 'var' จะมีขอบเขตการทำงานครอบคลุมทั้งฟังก์ชันที่มันประกาศอยู่ (Function Scope)"
      },
      {
        id: "js-q2",
        text: "ผลลัพธ์ของคำสั่ง `typeof null` ใน JavaScript คือข้อใด?",
        type: "single-choice",
        options: [
          "\"null\"",
          "\"undefined\"",
          "\"object\"",
          "\"number\""
        ],
        correctAnswer: 2,
        explanation: "ใน JavaScript `typeof null` จะคืนค่ากลับมาเป็น \"object\" ซึ่งถือเป็นบั๊กในระบบการสร้างภาษา JavaScript ยุคเริ่มแรก แต่ถูกคงไว้เพื่อไม่ให้โค้ดเก่าในโลกเว็บพังลง"
      },
      {
        id: "js-q3",
        text: "ข้อใดต่อไปนี้ไม่ใช่ประเภทข้อมูลพื้นฐาน (Primitive Type) ใน JavaScript?",
        type: "single-choice",
        options: [
          "String",
          "Boolean",
          "Array",
          "Symbol"
        ],
        correctAnswer: 2,
        explanation: "Primitive Types ใน JavaScript มีทั้งหมด 7 ชนิด ได้แก่ string, number, bigint, boolean, undefined, symbol, และ null ส่วน Array จัดเป็นประเภท Object ซึ่งไม่ใช่ Primitive"
      },
      {
        id: "js-q4",
        text: "ผลลัพธ์ของนิพจน์ `[] == ![]` ใน JavaScript คือค่าใด?",
        type: "single-choice",
        options: [
          "true",
          "false",
          "TypeError",
          "undefined"
        ],
        correctAnswer: 0,
        explanation: "ใน JavaScript `[]` เป็น Object ที่มีค่าความจริงเป็น truthy ดังนั้น `![]` จึงกลายเป็น `false` หลังจากนั้นนิพจน์เปรียบเทียบ `[] == false` จะทำการแปลงประเภทข้อมูล (Type Coercion) ให้เป็นตัวเลข ซึ่งทั้งสองข้างจะแปลงได้ค่า 0 เท่ากัน ส่งผลให้ผลลัพธ์เป็น `true`"
      },
      {
        id: "js-q5",
        text: "ฟังก์ชันประเภทใดที่ไม่มี `this` context เป็นของตัวเอง และอ้างอิง `this` จากขอบเขตนอกสุดแทน?",
        type: "single-choice",
        options: [
          "Regular Function",
          "Arrow Function",
          "Generator Function",
          "Anonymous Function"
        ],
        correctAnswer: 1,
        explanation: "Arrow Function (`() => {}`) จะไม่มี binding ของ `this`เป็นของตัวเอง โดยจะดึงค่า `this` จาก Lexical Scope (หรือสภาพแวดล้อมโดยรอบขณะที่ฟังก์ชันถูกประกาศขึ้นมา) มาใช้งานโดยตรง"
      }
    ]
  },
  {
    id: "exam-general-science",
    title: "วิทยาศาสตร์ทั่วไปและโลกของเรา",
    category: "Science",
    description: "แบบทดสอบวัดความรู้ทั่วไปด้านวิทยาศาสตร์ ดาราศาสตร์ และปรากฏการณ์ธรรมชาติ",
    timeLimit: 15,
    passPercentage: 60,
    questions: [
      {
        id: "sci-q1",
        text: "ดาวเคราะห์ดวงใดในระบบสุริยะของเราที่มีอุณหภูมิพื้นผิวสูงที่สุด?",
        type: "single-choice",
        options: [
          "ดาวพุธ (Mercury)",
          "ดาวศุกร์ (Venus)",
          "ดาวอังคาร (Mars)",
          "ดาวพฤหัสบดี (Jupiter)"
        ],
        correctAnswer: 1,
        explanation: "แม้ดาวพุธจะอยู่ใกล้ดวงอาทิตย์มากที่สุด แต่ดาวศุกร์กลับร้อนที่สุดเนื่องจากชั้นบรรยากาศที่หนาแน่นเต็มไปด้วยก๊าซคาร์บอนไดออกไซด์ เกิดเป็นสภาวะเรือนกระจกขั้นรุนแรงที่ดักจับความร้อนไว้บนผิวดาว"
      },
      {
        id: "sci-q2",
        text: "อวัยวะส่วนใดของร่างกายมนุษย์มีหน้าที่ควบคุมการเต้นของหัวใจและการหายใจโดยอัตโนมัติ?",
        type: "single-choice",
        options: [
          "ซีรีบรัม (Cerebrum)",
          "ซีรีเบลลัม (Cerebellum)",
          "เมดัลลา ออบลองกาตา (Medulla Oblongata)",
          "ทาลามัส (Thalamus)"
        ],
        correctAnswer: 2,
        explanation: "ก้านสมองส่วน เมดัลลา ออบลองกาตา (Medulla Oblongata) ทำหน้าที่ควบคุมฟังก์ชันพื้นฐานที่ไม่ได้อยู่ภายใต้การควบคุมของจิตใจ เช่น อัตราการเต้นของหัวใจ ความดันโลหิต และการหายใจ"
      },
      {
        id: "sci-q3",
        text: "ก๊าซชนิดใดที่มีสัดส่วนมากที่สุดในชั้นบรรยากาศของโลก?",
        type: "single-choice",
        options: [
          "ออกซิเจน (Oxygen)",
          "ไนโตรเจน (Nitrogen)",
          "คาร์บอนไดออกไซด์ (Carbon Dioxide)",
          "อาร์กอน (Argon)"
        ],
        correctAnswer: 1,
        explanation: "ชั้นบรรยากาศของโลกประกอบด้วยก๊าซไนโตรเจนประมาณ 78% ก๊าซออกซิเจนประมาณ 21% อาร์กอนประมาณ 0.93% และที่เหลือเป็นก๊าซอื่นๆ รวมถึงคาร์บอนไดออกไซด์"
      }
    ]
  }
];
