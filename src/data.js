// ============================================================
// data.js - ข้อมูลหลักสำหรับระบบกำกับติดตามการเรียนของนักศึกษา
// ครุศาสตรบัณฑิต สาขาวิชาการประถมศึกษา มหาวิทยาลัยราชภัฏยะลา
// ============================================================

window.AppData = {

  // ============================================================
  // GRADE_POINTS - ค่าระดับคะแนน
  // ============================================================
  GRADE_POINTS: {
    'A':    4.0,
    'B+':   3.5,
    'B':    3.0,
    'C+':   2.5,
    'C':    2.0,
    'D+':   1.5,
    'D':    1.0,
    'F':    0,
    'E':    0,
    'W':    null,
    'กำลังเรียน': null
  },

  // ============================================================
  // CURRICULUM_META - ข้อมูลหลักสูตร
  // ============================================================
  CURRICULUM_META: {
    name: "ครุศาสตรบัณฑิต สาขาวิชาการประถมศึกษา",
    totalCredits: 136,
    categories: [
      { id: "general",        name: "หมวดวิชาศึกษาทั่วไป",     requiredCredits: 30, color: "blue"   },
      { id: "profession",     name: "หมวดวิชาชีพครู",           requiredCredits: 34, color: "green"  },
      { id: "major",          name: "หมวดวิชาเอกบังคับ",        requiredCredits: 60, color: "purple" },
      { id: "major_elective", name: "หมวดวิชาเอกเลือก",         requiredCredits: 6,  color: "indigo" },
      { id: "elective",       name: "หมวดวิชาเลือกเสรี",        requiredCredits: 6,  color: "orange" }
    ]
  },

  // ============================================================
  // COURSES - รายวิชาทั้งหมดในหลักสูตร
  // ============================================================
  COURSES: [

    // ----------------------------------------------------------
    // หมวดวิชาศึกษาทั่วไป (general) - 10 วิชา x 3 หน่วยกิต = 30 หน่วยกิต
    // ----------------------------------------------------------
    { code: "GE1001", name: "ภาษาไทยเพื่อการสื่อสาร",                  credits: 3, category: "general", year: 1, semester: 1, isElective: false },
    { code: "GE1002", name: "ภาษาอังกฤษเพื่อการสื่อสาร 1",             credits: 3, category: "general", year: 1, semester: 1, isElective: false },
    { code: "GE1003", name: "สังคมและวัฒนธรรมไทย",                      credits: 3, category: "general", year: 1, semester: 1, isElective: false },
    { code: "GE1004", name: "คณิตศาสตร์และสถิติ",                       credits: 3, category: "general", year: 1, semester: 2, isElective: false },
    { code: "GE1005", name: "ภาษาอังกฤษเพื่อการสื่อสาร 2",             credits: 3, category: "general", year: 1, semester: 2, isElective: false },
    { code: "GE2001", name: "สุนทรียศาสตร์และศิลปวัฒนธรรม",            credits: 3, category: "general", year: 2, semester: 1, isElective: false },
    { code: "GE2002", name: "มนุษย์กับสิ่งแวดล้อม",                     credits: 3, category: "general", year: 2, semester: 1, isElective: false },
    { code: "GE2003", name: "ทักษะการคิดและการแก้ปัญหา",               credits: 3, category: "general", year: 2, semester: 1, isElective: false },
    { code: "GE2004", name: "ความเป็นพลเมืองในสังคมประชาธิปไตย",       credits: 3, category: "general", year: 2, semester: 2, isElective: false },
    { code: "GE2005", name: "ภาษาอังกฤษในชีวิตประจำวัน",               credits: 3, category: "general", year: 2, semester: 2, isElective: false },

    // ----------------------------------------------------------
    // หมวดวิชาชีพครู (profession) - 11 วิชา = 34 หน่วยกิต
    // ----------------------------------------------------------
    { code: "4204101", name: "ความเป็นครู",                                           credits: 3, category: "profession", year: 1, semester: 1, isElective: false },
    { code: "4204102", name: "ภาษาและวัฒนธรรมสำหรับครู",                             credits: 3, category: "profession", year: 1, semester: 2, isElective: false },
    { code: "4204201", name: "ปรัชญาการศึกษาและจิตวิทยาสำหรับครู",                   credits: 3, category: "profession", year: 2, semester: 1, isElective: false },
    { code: "4204202", name: "หลักสูตรและการออกแบบการเรียนรู้",                       credits: 3, category: "profession", year: 2, semester: 1, isElective: false },
    { code: "4204203", name: "นวัตกรรมและเทคโนโลยีสารสนเทศทางการศึกษา",             credits: 3, category: "profession", year: 2, semester: 2, isElective: false },
    { code: "4204301", name: "จิตวิทยาการเรียนรู้และการพัฒนาผู้เรียน",               credits: 3, category: "profession", year: 3, semester: 1, isElective: false },
    { code: "4204302", name: "การวัดและประเมินผลการเรียนรู้",                         credits: 3, category: "profession", year: 3, semester: 1, isElective: false },
    { code: "4204303", name: "การบริหารจัดการชั้นเรียน",                             credits: 3, category: "profession", year: 3, semester: 2, isElective: false },
    { code: "4204304", name: "การวิจัยทางการศึกษา",                                  credits: 3, category: "profession", year: 3, semester: 2, isElective: false },
    { code: "4204401", name: "การปฏิบัติการสอนในสถานศึกษา 1",                        credits: 6, category: "profession", year: 4, semester: 1, isElective: false },
    { code: "4204402", name: "การปฏิบัติการสอนในสถานศึกษา 2",                        credits: 6, category: "profession", year: 4, semester: 2, isElective: false },

    // ----------------------------------------------------------
    // หมวดวิชาเอกบังคับ (major) - 20 วิชา = 60 หน่วยกิต
    // ----------------------------------------------------------
    { code: "PE1101", name: "ภาษาไทยสำหรับครูประถม",                               credits: 3, category: "major", year: 1, semester: 1, isElective: false },
    { code: "PE1102", name: "คณิตศาสตร์สำหรับครูประถม 1",                          credits: 3, category: "major", year: 1, semester: 1, isElective: false },
    { code: "PE1201", name: "วิทยาศาสตร์สำหรับครูประถม 1",                         credits: 3, category: "major", year: 1, semester: 2, isElective: false },
    { code: "PE1202", name: "สังคมศึกษาสำหรับครูประถม 1",                          credits: 3, category: "major", year: 1, semester: 2, isElective: false },
    { code: "PE2101", name: "คณิตศาสตร์สำหรับครูประถม 2",                          credits: 3, category: "major", year: 2, semester: 1, isElective: false },
    { code: "PE2102", name: "ภาษาอังกฤษสำหรับครูประถม",                            credits: 3, category: "major", year: 2, semester: 1, isElective: false },
    { code: "PE2103", name: "ศิลปะสำหรับครูประถม",                                 credits: 3, category: "major", year: 2, semester: 2, isElective: false },
    { code: "PE2104", name: "การงานอาชีพและเทคโนโลยีสำหรับครูประถม",              credits: 3, category: "major", year: 2, semester: 2, isElective: false },
    { code: "PE3101", name: "วิทยาศาสตร์สำหรับครูประถม 2",                         credits: 3, category: "major", year: 3, semester: 1, isElective: false },
    { code: "PE3102", name: "สังคมศึกษาสำหรับครูประถม 2",                          credits: 3, category: "major", year: 3, semester: 1, isElective: false },
    { code: "PE3103", name: "สุขศึกษาและพลศึกษาสำหรับครูประถม",                   credits: 3, category: "major", year: 3, semester: 1, isElective: false },
    { code: "PE3201", name: "ดนตรีและนาฏศิลป์สำหรับครูประถม",                     credits: 3, category: "major", year: 3, semester: 2, isElective: false },
    { code: "PE3202", name: "การจัดกิจกรรมลูกเสือเนตรนารี",                       credits: 3, category: "major", year: 3, semester: 2, isElective: false },
    { code: "PE3203", name: "การส่งเสริมนิสัยรักการอ่าน",                          credits: 3, category: "major", year: 3, semester: 2, isElective: false },
    { code: "PE4101", name: "โครงงานวิจัยปฏิบัติการในชั้นเรียน",                   credits: 3, category: "major", year: 4, semester: 1, isElective: false },
    { code: "PE4102", name: "การประเมินหลักสูตรสถานศึกษา",                         credits: 3, category: "major", year: 4, semester: 1, isElective: false },
    { code: "PE4103", name: "ชุมชนแห่งการเรียนรู้ทางวิชาชีพ",                     credits: 3, category: "major", year: 4, semester: 2, isElective: false },
    { code: "PE4104", name: "นวัตกรรมการสอนสำหรับครูประถม",                       credits: 3, category: "major", year: 4, semester: 2, isElective: false },
    { code: "PE4105", name: "การบูรณาการความรู้สู่การสอน",                         credits: 3, category: "major", year: 4, semester: 2, isElective: false },
    { code: "PE4106", name: "การพัฒนาสื่อการสอน",                                  credits: 3, category: "major", year: 4, semester: 2, isElective: false },

    // ----------------------------------------------------------
    // หมวดวิชาเอกเลือก (major_elective) - เลือก 2 วิชา x 3 หน่วยกิต = 6 หน่วยกิต
    // ----------------------------------------------------------
    { code: "PE_EL01", name: "เทคโนโลยีดิจิทัลเพื่อการศึกษา",                     credits: 3, category: "major_elective", year: null, semester: null, isElective: true },
    { code: "PE_EL02", name: "การศึกษาพิเศษเบื้องต้น",                            credits: 3, category: "major_elective", year: null, semester: null, isElective: true },
    { code: "PE_EL03", name: "การแนะแนวและให้คำปรึกษาในโรงเรียน",                credits: 3, category: "major_elective", year: null, semester: null, isElective: true },
    { code: "PE_EL04", name: "ภาษาอังกฤษสำหรับครูประถมศึกษาชั้นสูง",            credits: 3, category: "major_elective", year: null, semester: null, isElective: true },

    // ----------------------------------------------------------
    // หมวดวิชาเลือกเสรี (elective) - เลือก 2 วิชา x 3 หน่วยกิต = 6 หน่วยกิต
    // ----------------------------------------------------------
    { code: "FREE01", name: "ภาษาอังกฤษเพื่อธุรกิจ",                              credits: 3, category: "elective", year: null, semester: null, isElective: true },
    { code: "FREE02", name: "ความรู้เบื้องต้นเกี่ยวกับกฎหมาย",                   credits: 3, category: "elective", year: null, semester: null, isElective: true },
    { code: "FREE03", name: "การถ่ายภาพดิจิทัล",                                  credits: 3, category: "elective", year: null, semester: null, isElective: true },
    { code: "FREE04", name: "ทักษะชีวิตและสุขภาพ",                                credits: 3, category: "elective", year: null, semester: null, isElective: true }

  ],

  // ============================================================
  // INITIAL_STUDENTS - ข้อมูลนักศึกษาเริ่มต้น
  // ============================================================
  INITIAL_STUDENTS: [

    // ----------------------------------------------------------
    // s001 - นายสมชาย ใจดี (ปี 3 เทอม 1) - นักศึกษาปกติ เกรดดี
    // ----------------------------------------------------------
    {
      id: "s001",
      studentId: "6640112001",
      name: "นายสมชาย ใจดี",
      username: "6640112001",
      password: "1234",
      advisorId: "a001",
      year: 3,
      currentSemester: 1,
      enrollments: [
        // ปีการศึกษา 1 เทอม 1
        { courseCode: "GE1001",  year: 1, semester: 1, grade: "B",        type: "Credit" },
        { courseCode: "GE1002",  year: 1, semester: 1, grade: "C+",       type: "Credit" },
        { courseCode: "GE1003",  year: 1, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "4204101", year: 1, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "PE1101",  year: 1, semester: 1, grade: "B",        type: "Credit" },
        { courseCode: "PE1102",  year: 1, semester: 1, grade: "C",        type: "Credit" },
        // ปีการศึกษา 1 เทอม 2
        { courseCode: "GE1004",  year: 1, semester: 2, grade: "B+",       type: "Credit" },
        { courseCode: "GE1005",  year: 1, semester: 2, grade: "B",        type: "Credit" },
        { courseCode: "4204102", year: 1, semester: 2, grade: "A",        type: "Credit" },
        { courseCode: "PE1201",  year: 1, semester: 2, grade: "B",        type: "Credit" },
        { courseCode: "PE1202",  year: 1, semester: 2, grade: "B+",       type: "Credit" },
        // ปีการศึกษา 2 เทอม 1
        { courseCode: "GE2001",  year: 2, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "GE2002",  year: 2, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "GE2003",  year: 2, semester: 1, grade: "B",        type: "Credit" },
        { courseCode: "4204201", year: 2, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "4204202", year: 2, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "PE2101",  year: 2, semester: 1, grade: "B",        type: "Credit" },
        { courseCode: "PE2102",  year: 2, semester: 1, grade: "B+",       type: "Credit" },
        // ปีการศึกษา 2 เทอม 2
        { courseCode: "GE2004",  year: 2, semester: 2, grade: "B",        type: "Credit" },
        { courseCode: "GE2005",  year: 2, semester: 2, grade: "A",        type: "Credit" },
        { courseCode: "4204203", year: 2, semester: 2, grade: "B+",       type: "Credit" },
        { courseCode: "PE2103",  year: 2, semester: 2, grade: "B",        type: "Credit" },
        { courseCode: "PE2104",  year: 2, semester: 2, grade: "B+",       type: "Credit" },
        // ปีการศึกษา 3 เทอม 1 - กำลังเรียน
        { courseCode: "4204301", year: 3, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "4204302", year: 3, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE3101",  year: 3, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE3102",  year: 3, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE3103",  year: 3, semester: 1, grade: "กำลังเรียน", type: "Credit" }
      ]
    },

    // ----------------------------------------------------------
    // s002 - นางสาวสุดา สวยงาม (ปี 2 เทอม 2) - นักศึกษาเกรดดีมาก
    // ----------------------------------------------------------
    {
      id: "s002",
      studentId: "6640112002",
      name: "นางสาวสุดา สวยงาม",
      username: "6640112002",
      password: "1234",
      advisorId: "a001",
      year: 2,
      currentSemester: 2,
      enrollments: [
        // ปีการศึกษา 1 เทอม 1
        { courseCode: "GE1001",  year: 1, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "GE1002",  year: 1, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "GE1003",  year: 1, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "4204101", year: 1, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "PE1101",  year: 1, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "PE1102",  year: 1, semester: 1, grade: "B",        type: "Credit" },
        // ปีการศึกษา 1 เทอม 2
        { courseCode: "GE1004",  year: 1, semester: 2, grade: "A",        type: "Credit" },
        { courseCode: "GE1005",  year: 1, semester: 2, grade: "B+",       type: "Credit" },
        { courseCode: "4204102", year: 1, semester: 2, grade: "A",        type: "Credit" },
        { courseCode: "PE1201",  year: 1, semester: 2, grade: "A",        type: "Credit" },
        { courseCode: "PE1202",  year: 1, semester: 2, grade: "B+",       type: "Credit" },
        // ปีการศึกษา 2 เทอม 1
        { courseCode: "GE2001",  year: 2, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "GE2002",  year: 2, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "GE2003",  year: 2, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "4204201", year: 2, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "4204202", year: 2, semester: 1, grade: "A",        type: "Credit" },
        { courseCode: "PE2101",  year: 2, semester: 1, grade: "B+",       type: "Credit" },
        { courseCode: "PE2102",  year: 2, semester: 1, grade: "A",        type: "Credit" },
        // ปีการศึกษา 2 เทอม 2 - กำลังเรียน
        { courseCode: "GE2004",  year: 2, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "GE2005",  year: 2, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "4204203", year: 2, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE2103",  year: 2, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE2104",  year: 2, semester: 2, grade: "กำลังเรียน", type: "Credit" }
      ]
    },

    // ----------------------------------------------------------
    // s003 - นายวิชัย รักเรียน (ปี 4 เทอม 1) - เคยสอบตก แต่แก้ไขแล้ว
    // ----------------------------------------------------------
    {
      id: "s003",
      studentId: "6440112003",
      name: "นายวิชัย รักเรียน",
      username: "6440112003",
      password: "1234",
      advisorId: "a001",
      year: 4,
      currentSemester: 1,
      enrollments: [
        // ปีการศึกษา 1 เทอม 1
        { courseCode: "GE1001",  year: 1, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "GE1002",  year: 1, semester: 1, grade: "C",  type: "Credit" },
        { courseCode: "GE1003",  year: 1, semester: 1, grade: "B+", type: "Credit" },
        { courseCode: "4204101", year: 1, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "PE1101",  year: 1, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "PE1102",  year: 1, semester: 1, grade: "E",  type: "Credit" }, // สอบตก
        // ปีการศึกษา 1 เทอม 2
        { courseCode: "GE1004",  year: 1, semester: 2, grade: "C",  type: "Credit" },
        { courseCode: "GE1005",  year: 1, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "4204102", year: 1, semester: 2, grade: "B",  type: "Credit" },
        { courseCode: "PE1201",  year: 1, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "PE1202",  year: 1, semester: 2, grade: "B",  type: "Credit" },
        // ปีการศึกษา 2 เทอม 1 (ลงทะเบียนซ้ำ PE1102)
        { courseCode: "PE1102",  year: 2, semester: 1, grade: "C",  type: "Credit" }, // เรียนซ้ำ - ผ่าน
        { courseCode: "GE2001",  year: 2, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "GE2002",  year: 2, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "GE2003",  year: 2, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "4204201", year: 2, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "4204202", year: 2, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "PE2101",  year: 2, semester: 1, grade: "C",  type: "Credit" },
        // ปีการศึกษา 2 เทอม 2
        { courseCode: "GE2004",  year: 2, semester: 2, grade: "B+", type: "Credit" },
        { courseCode: "GE2005",  year: 2, semester: 2, grade: "B",  type: "Credit" },
        { courseCode: "4204203", year: 2, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "PE2102",  year: 2, semester: 2, grade: "B",  type: "Credit" },
        { courseCode: "PE2103",  year: 2, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "PE2104",  year: 2, semester: 2, grade: "B",  type: "Credit" },
        // ปีการศึกษา 3 เทอม 1
        { courseCode: "4204301", year: 3, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "4204302", year: 3, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "PE3101",  year: 3, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "PE3102",  year: 3, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "PE3103",  year: 3, semester: 1, grade: "B",  type: "Credit" },
        // ปีการศึกษา 3 เทอม 2
        { courseCode: "4204303", year: 3, semester: 2, grade: "B+", type: "Credit" },
        { courseCode: "4204304", year: 3, semester: 2, grade: "B",  type: "Credit" },
        { courseCode: "PE3201",  year: 3, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "PE3202",  year: 3, semester: 2, grade: "B",  type: "Credit" },
        { courseCode: "PE3203",  year: 3, semester: 2, grade: "C",  type: "Credit" },
        // วิชาเลือก
        { courseCode: "PE_EL01", year: 3, semester: 2, grade: "B+", type: "Credit" },
        { courseCode: "FREE01",  year: 3, semester: 2, grade: "B",  type: "Credit" },
        // ปีการศึกษา 4 เทอม 1 - กำลังเรียน
        { courseCode: "4204401", year: 4, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE4101",  year: 4, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE4102",  year: 4, semester: 1, grade: "กำลังเรียน", type: "Credit" }
      ]
    },

    // ----------------------------------------------------------
    // s004 - นางสาวนิตยา ขยันดี (ปี 3 เทอม 2) - นักศึกษาที่มีความเสี่ยง (AT-RISK)
    // ----------------------------------------------------------
    {
      id: "s004",
      studentId: "6540112004",
      name: "นางสาวนิตยา ขยันดี",
      username: "6540112004",
      password: "1234",
      advisorId: "a002",
      year: 3,
      currentSemester: 2,
      enrollments: [
        // ปีการศึกษา 1 เทอม 1
        { courseCode: "GE1001",  year: 1, semester: 1, grade: "C",  type: "Credit" },
        { courseCode: "GE1002",  year: 1, semester: 1, grade: "D+", type: "Credit" },
        { courseCode: "GE1003",  year: 1, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "4204101", year: 1, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "PE1101",  year: 1, semester: 1, grade: "C",  type: "Credit" },
        { courseCode: "PE1102",  year: 1, semester: 1, grade: "D",  type: "Credit" },
        // ปีการศึกษา 1 เทอม 2
        { courseCode: "GE1004",  year: 1, semester: 2, grade: "E",  type: "Credit" }, // สอบตก
        { courseCode: "GE1005",  year: 1, semester: 2, grade: "C",  type: "Credit" },
        { courseCode: "4204102", year: 1, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "PE1201",  year: 1, semester: 2, grade: "E",  type: "Credit" }, // สอบตก
        { courseCode: "PE1202",  year: 1, semester: 2, grade: "D+", type: "Credit" },
        // ปีการศึกษา 2 เทอม 1 (ลงทะเบียนซ้ำวิชาที่สอบตก)
        { courseCode: "GE1004",  year: 2, semester: 1, grade: "C+", type: "Credit" }, // เรียนซ้ำ - ผ่าน
        { courseCode: "GE2001",  year: 2, semester: 1, grade: "C",  type: "Credit" },
        { courseCode: "GE2002",  year: 2, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "4204201", year: 2, semester: 1, grade: "C",  type: "Credit" },
        { courseCode: "PE2101",  year: 2, semester: 1, grade: "D+", type: "Credit" },
        // ปีการศึกษา 2 เทอม 2
        { courseCode: "PE1201",  year: 2, semester: 2, grade: "C",  type: "Credit" }, // เรียนซ้ำ - ผ่าน
        { courseCode: "GE2003",  year: 2, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "GE2004",  year: 2, semester: 2, grade: "C",  type: "Credit" },
        { courseCode: "4204202", year: 2, semester: 2, grade: "C+", type: "Credit" },
        { courseCode: "4204203", year: 2, semester: 2, grade: "C",  type: "Credit" },
        { courseCode: "PE2102",  year: 2, semester: 2, grade: "D+", type: "Credit" },
        { courseCode: "PE2103",  year: 2, semester: 2, grade: "E",  type: "Credit" }, // สอบตกซ้ำ
        // ปีการศึกษา 3 เทอม 1
        { courseCode: "GE2005",  year: 3, semester: 1, grade: "C",  type: "Credit" },
        { courseCode: "4204301", year: 3, semester: 1, grade: "C+", type: "Credit" },
        { courseCode: "PE2103",  year: 3, semester: 1, grade: "C+", type: "Credit" }, // เรียนซ้ำ - ผ่าน
        { courseCode: "PE2104",  year: 3, semester: 1, grade: "D+", type: "Credit" },
        { courseCode: "PE3101",  year: 3, semester: 1, grade: "C",  type: "Credit" },
        // ปีการศึกษา 3 เทอม 2 - กำลังเรียน
        { courseCode: "4204302", year: 3, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "4204303", year: 3, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE3102",  year: 3, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE3103",  year: 3, semester: 2, grade: "กำลังเรียน", type: "Credit" }
      ]
    },

    // ----------------------------------------------------------
    // s005 - นายอนุชา มีปัญญา (ปี 2 เทอม 1) - นักศึกษาปกติ
    // ----------------------------------------------------------
    {
      id: "s005",
      studentId: "6640112005",
      name: "นายอนุชา มีปัญญา",
      username: "6640112005",
      password: "1234",
      advisorId: "a002",
      year: 2,
      currentSemester: 1,
      enrollments: [
        // ปีการศึกษา 1 เทอม 1
        { courseCode: "GE1001",  year: 1, semester: 1, grade: "B+", type: "Credit" },
        { courseCode: "GE1002",  year: 1, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "GE1003",  year: 1, semester: 1, grade: "A",  type: "Credit" },
        { courseCode: "4204101", year: 1, semester: 1, grade: "B+", type: "Credit" },
        { courseCode: "PE1101",  year: 1, semester: 1, grade: "B",  type: "Credit" },
        { courseCode: "PE1102",  year: 1, semester: 1, grade: "B+", type: "Credit" },
        // ปีการศึกษา 1 เทอม 2
        { courseCode: "GE1004",  year: 1, semester: 2, grade: "B",  type: "Credit" },
        { courseCode: "GE1005",  year: 1, semester: 2, grade: "B+", type: "Credit" },
        { courseCode: "4204102", year: 1, semester: 2, grade: "A",  type: "Credit" },
        { courseCode: "PE1201",  year: 1, semester: 2, grade: "B+", type: "Credit" },
        { courseCode: "PE1202",  year: 1, semester: 2, grade: "B",  type: "Credit" },
        // ปีการศึกษา 2 เทอม 1 - กำลังเรียน
        { courseCode: "GE2001",  year: 2, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "GE2002",  year: 2, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "4204201", year: 2, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "4204202", year: 2, semester: 1, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE2101",  year: 2, semester: 1, grade: "กำลังเรียน", type: "Credit" }
      ]
    },

    // ----------------------------------------------------------
    // s006 - นางสาวพิมพ์ใจ ดวงแก้ว (ปี 1 เทอม 2) - นักศึกษาใหม่ เกรดดีเยี่ยม
    // ----------------------------------------------------------
    {
      id: "s006",
      studentId: "6740112006",
      name: "นางสาวพิมพ์ใจ ดวงแก้ว",
      username: "6740112006",
      password: "1234",
      advisorId: "a002",
      year: 1,
      currentSemester: 2,
      enrollments: [
        // ปีการศึกษา 1 เทอม 1
        { courseCode: "GE1001",  year: 1, semester: 1, grade: "A",  type: "Credit" },
        { courseCode: "GE1002",  year: 1, semester: 1, grade: "B+", type: "Credit" },
        { courseCode: "GE1003",  year: 1, semester: 1, grade: "A",  type: "Credit" },
        { courseCode: "4204101", year: 1, semester: 1, grade: "A",  type: "Credit" },
        { courseCode: "PE1101",  year: 1, semester: 1, grade: "B+", type: "Credit" },
        { courseCode: "PE1102",  year: 1, semester: 1, grade: "A",  type: "Credit" },
        // ปีการศึกษา 1 เทอม 2 - กำลังเรียน
        { courseCode: "GE1004",  year: 1, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "GE1005",  year: 1, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "4204102", year: 1, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE1201",  year: 1, semester: 2, grade: "กำลังเรียน", type: "Credit" },
        { courseCode: "PE1202",  year: 1, semester: 2, grade: "กำลังเรียน", type: "Credit" }
      ]
    }

  ],

  // ============================================================
  // INITIAL_ADVISORS - ข้อมูลอาจารย์ที่ปรึกษา
  // ============================================================
  // ============================================================
  // INITIAL_EQUIPMENT - อุปกรณ์คณิตศาสตร์เริ่มต้น
  // ============================================================
  INITIAL_EQUIPMENT: [
    { id: 'eq001', code: 'MATH-001', name: 'ชุดเรขาคณิตสามมิติ',       totalQuantity: 5,  availableQuantity: 5,  imageUrl: null, description: 'ชุดรูปทรงสามมิติสำหรับการสอนเรขาคณิต', borrowType: 'borrow' },
    { id: 'eq002', code: 'MATH-002', name: 'เครื่องคิดเลขวิทยาศาสตร์', totalQuantity: 20, availableQuantity: 20, imageUrl: null, description: 'Casio FX-991EX', borrowType: 'borrow' },
    { id: 'eq003', code: 'MATH-003', name: 'อุปกรณ์สร้างสื่อการสอน',    totalQuantity: 3,  availableQuantity: 3,  imageUrl: null, description: 'ชุดอุปกรณ์สำหรับทำสื่อการสอนคณิตศาสตร์', borrowType: 'borrow' },
    { id: 'eq004', code: 'MATH-004', name: 'บอร์ดเกมคณิตศาสตร์',        totalQuantity: 8,  availableQuantity: 8,  imageUrl: null, description: 'เกมกระดานสำหรับฝึกทักษะคณิตศาสตร์', borrowType: 'borrow' },
    { id: 'eq005', code: 'MATH-005', name: 'กระดานแสดงแผนภูมิ',         totalQuantity: 4,  availableQuantity: 4,  imageUrl: null, description: 'กระดาน Whiteboard พกพา', borrowType: 'borrow' }
  ],

  INITIAL_ADVISORS: [
    {
      id: "a001",
      name: "รศ.ดร.มาลี สุขใจ",
      username: "malee",
      password: "advisor1234",
      email: "malee@yru.ac.th",
      department: "สาขาวิชาการประถมศึกษา",
      phone: "073-299-600 ต่อ 1234",
      studentIds: ["s001", "s002", "s003"]
    },
    {
      id: "a002",
      name: "ผศ.ดร.สมศักดิ์ วิชาการ",
      username: "somsak",
      password: "advisor1234",
      email: "somsak@yru.ac.th",
      department: "สาขาวิชาการประถมศึกษา",
      phone: "073-299-600 ต่อ 1235",
      studentIds: ["s004", "s005", "s006"]
    }
  ]

};

// ============================================================
// FIREBASE INIT + SEED
// เรียกใช้จาก AppProvider ตอน mount
// ============================================================
window.initFirebase = function() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  }
  return firebase.firestore();
};

// เติมข้อมูลตัวอย่างถ้า collection ยังว่างอยู่
window.seedFirestoreIfEmpty = async function(db) {
  if (!window.SEED_ON_EMPTY) return;

  const snap = await db.collection('students').limit(1).get();
  if (!snap.empty) return; // มีข้อมูลแล้ว ไม่ seed ซ้ำ

  console.log('🌱 Seeding Firestore with initial data...');
  const batch = db.batch();

  // Students
  window.AppData.INITIAL_STUDENTS.forEach(function(s) {
    batch.set(db.collection('students').doc(s.id), s);
  });

  // Advisors
  window.AppData.INITIAL_ADVISORS.forEach(function(a) {
    batch.set(db.collection('advisors').doc(a.id), a);
  });

  // Courses
  window.AppData.COURSES.forEach(function(c) {
    batch.set(db.collection('courses').doc(c.code), c);
  });

  // Curriculum meta
  batch.set(db.collection('settings').doc('curriculum'), window.AppData.CURRICULUM_META);

  await batch.commit();
  console.log('✅ Firestore seeded successfully');

  // Seed equipment
  var eqSnap = await db.collection('equipment').limit(1).get();
  if (eqSnap.empty) {
    var eqBatch = db.batch();
    window.AppData.INITIAL_EQUIPMENT.forEach(function(eq) {
      eqBatch.set(db.collection('equipment').doc(eq.id), eq);
    });
    await eqBatch.commit();
    console.log('✅ Seeded equipment');
  }
};
