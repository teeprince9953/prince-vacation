import { getStore } from "@netlify/blobs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const STORE_NAME = "prince-vacation-store";
const STORE_KEY = "vacation-data";

const COLOR_PALETTE = [
  "#ef4444", "#f97316", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#06b6d4",
  "#84cc16", "#d946ef", "#0ea5e9", "#fb7185", "#10b981"
];

const DEFAULT_DATA = {
  settings: {
    year: 2026,
    title: "프린스 하계휴가 일정",
    startDate: "2026-07-25",
    endDate: "2026-08-30",
    checkDeadline: "2026-07-18",
    memo: "7월 마지막주부터 8월 마지막주까지"
  },
  members: [
    { name: "도승지", color: "#ef4444" },
    { name: "정훈필", color: "#f97316" },
    { name: "김영훈", color: "#22c55e" },
    { name: "유시은", color: "#3b82f6" },
    { name: "지영은", color: "#8b5cf6" }
  ],
  choices: {},
  updatedAt: null
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function responseJson(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders });
}

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date;
}

function toYMD(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getMondayOnOrAfter(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 1 ? 0 : (8 - day) % 7;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function getLastMondayOfMonth(year, monthIndex) {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));
  const day = last.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  return addDays(last, -diff);
}

function getWeekOfMonthByMonday(monday) {
  const first = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), 1));
  const firstMonday = getMondayOnOrAfter(first);
  if (monday < firstMonday) return 1;
  return Math.floor((monday - firstMonday) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function buildSlotLabel(monday) {
  const month = monday.getUTCMonth() + 1;
  const lastMonday = getLastMondayOfMonth(monday.getUTCFullYear(), monday.getUTCMonth());
  if (toYMD(monday) === toYMD(lastMonday)) return `${month}월 마지막주`;
  return `${month}월 ${getWeekOfMonthByMonday(monday)}주차`;
}

function buildSlots(settings) {
  const start = parseDate(settings.startDate);
  const end = parseDate(settings.endDate);
  if (!start || !end || start > end) return [];

  const result = [];
  const seen = new Set();
  let monday = getMondayOnOrAfter(start);

  while (monday <= end) {
    const rawSlotStart = addDays(monday, -2);
    const rawSlotEnd = addDays(monday, 6);
    const slotStart = rawSlotStart < start ? new Date(start) : rawSlotStart;
    const slotEnd = rawSlotEnd > end ? new Date(end) : rawSlotEnd;

    if (slotStart <= slotEnd) {
      const id = toYMD(monday);
      if (!seen.has(id)) {
        result.push({
          id,
          monday: id,
          label: buildSlotLabel(monday),
          start: toYMD(slotStart),
          end: toYMD(slotEnd)
        });
        seen.add(id);
      }
    }

    monday = addDays(monday, 7);
  }

  return result;
}

function normalizeMembers(members = []) {
  const usedNames = new Set();
  return members
    .map((member, index) => {
      const name = String(member?.name || "").trim();
      if (!name || usedNames.has(name)) return null;
      usedNames.add(name);
      return {
        name,
        color: /^#[0-9a-fA-F]{6}$/.test(String(member?.color || ""))
          ? member.color
          : COLOR_PALETTE[index % COLOR_PALETTE.length]
      };
    })
    .filter(Boolean);
}

function normalizeData(raw) {
  const base = cloneDefault();
  const settings = {
    ...base.settings,
    ...(raw?.settings || {})
  };

  const start = parseDate(settings.startDate) ? settings.startDate : base.settings.startDate;
  const end = parseDate(settings.endDate) ? settings.endDate : base.settings.endDate;
  const deadline = parseDate(settings.checkDeadline) ? settings.checkDeadline : base.settings.checkDeadline;
  const members = normalizeMembers(raw?.members?.length ? raw.members : base.members);
  const memberNames = new Set(members.map(m => m.name));
  const slots = buildSlots({ ...settings, startDate: start, endDate: end });
  const slotIds = new Set(slots.map(slot => slot.id));
  const choices = {};

  Object.entries(raw?.choices || {}).forEach(([name, slotId]) => {
    if (memberNames.has(name) && slotIds.has(slotId)) choices[name] = slotId;
  });

  return {
    settings: {
      year: Number(settings.year) || parseDate(start).getUTCFullYear(),
      title: String(settings.title || base.settings.title).trim() || base.settings.title,
      startDate: start,
      endDate: end,
      checkDeadline: deadline,
      memo: String(settings.memo || "").trim()
    },
    members,
    choices,
    updatedAt: raw?.updatedAt || null
  };
}

async function readData() {
  const store = getStore(STORE_NAME);
  const stored = await store.get(STORE_KEY, { type: "json" });
  const data = normalizeData(stored || cloneDefault());

  if (!stored) {
    data.updatedAt = new Date().toISOString();
    await store.setJSON(STORE_KEY, data);
  }

  return data;
}

async function writeData(data) {
  const store = getStore(STORE_NAME);
  const normalized = normalizeData({ ...data, updatedAt: new Date().toISOString() });
  await store.setJSON(STORE_KEY, normalized);
  return normalized;
}

function requireAdmin(password) {
  return String(password || "") === ADMIN_PASSWORD;
}

function koreaTodayYMD() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function isDeadlinePassed(settings) {
  return koreaTodayYMD() > String(settings?.checkDeadline || "9999-12-31");
}

function deadlineMessage() {
  return "휴가 체크 마감일이 지나 수정이나 체크가 불가합니다. 수정이나 추가가 필요한 경우 관리자에게 문의하세요.";
}

async function getBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export default async (request) => {
  if (request.method === "GET") {
    const data = await readData();
    return responseJson({ ok: true, data });
  }

  if (request.method !== "POST") {
    return responseJson({ ok: false, message: "허용되지 않는 요청입니다." }, 405);
  }

  const body = await getBody(request);
  const action = body.action;
  const data = await readData();

  if (action === "verifyAdmin") {
    if (!requireAdmin(body.adminPassword)) {
      return responseJson({ ok: false, message: "관리자 비밀번호가 맞지 않습니다." }, 401);
    }
    return responseJson({ ok: true, data });
  }

  if (action === "selectVacation") {
    if (isDeadlinePassed(data.settings)) {
      return responseJson({ ok: false, message: deadlineMessage() }, 403);
    }

    const memberName = String(body.memberName || "").trim();
    const slotId = String(body.slotId || "").trim();
    const member = data.members.find(m => m.name === memberName);
    const slot = buildSlots(data.settings).find(s => s.id === slotId);

    if (!member) return responseJson({ ok: false, message: "등록되지 않은 팀원입니다." }, 400);
    if (!slot) return responseJson({ ok: false, message: "선택할 수 없는 주차입니다." }, 400);

    const conflict = Object.entries(data.choices || {}).find(([name, selectedSlotId]) => {
      return name !== memberName && selectedSlotId === slotId;
    });

    if (conflict) {
      return responseJson({
        ok: false,
        code: "SLOT_ALREADY_TAKEN",
        message: `이미 ${conflict[0]}님이 선택한 주차입니다. 같은 주에는 2명 이상 신청할 수 없습니다. 다른 주차를 선택해주세요.`
      }, 409);
    }

    data.choices[memberName] = slotId;
    const saved = await writeData(data);
    return responseJson({ ok: true, data: saved });
  }

  if (action === "clearVacation") {
    if (isDeadlinePassed(data.settings)) {
      return responseJson({ ok: false, message: deadlineMessage() }, 403);
    }

    const memberName = String(body.memberName || "").trim();
    const member = data.members.find(m => m.name === memberName);
    if (!member) return responseJson({ ok: false, message: "등록되지 않은 팀원입니다." }, 400);
    delete data.choices[memberName];
    const saved = await writeData(data);
    return responseJson({ ok: true, data: saved });
  }

  if (action === "saveSettings") {
    if (!requireAdmin(body.adminPassword)) {
      return responseJson({ ok: false, message: "관리자 비밀번호가 맞지 않습니다." }, 401);
    }

    const incomingSettings = body.settings || {};
    const incomingMembers = normalizeMembers(body.members || data.members);

    if (!incomingMembers.length) {
      return responseJson({ ok: false, message: "팀원은 최소 1명 이상 필요합니다." }, 400);
    }

    const nextData = normalizeData({
      settings: {
        ...data.settings,
        year: incomingSettings.year,
        title: incomingSettings.title,
        startDate: incomingSettings.startDate,
        endDate: incomingSettings.endDate,
        checkDeadline: incomingSettings.checkDeadline,
        memo: incomingSettings.memo
      },
      members: incomingMembers,
      choices: data.choices
    });

    const saved = await writeData(nextData);
    return responseJson({ ok: true, data: saved });
  }

  if (action === "resetChoices") {
    if (!requireAdmin(body.adminPassword)) {
      return responseJson({ ok: false, message: "관리자 비밀번호가 맞지 않습니다." }, 401);
    }
    data.choices = {};
    const saved = await writeData(data);
    return responseJson({ ok: true, data: saved });
  }

  if (action === "importData") {
    if (!requireAdmin(body.adminPassword)) {
      return responseJson({ ok: false, message: "관리자 비밀번호가 맞지 않습니다." }, 401);
    }
    const saved = await writeData(body.data || cloneDefault());
    return responseJson({ ok: true, data: saved });
  }

  return responseJson({ ok: false, message: "알 수 없는 요청입니다." }, 400);
};
