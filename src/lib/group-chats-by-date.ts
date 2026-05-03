type ChatWithCreationTime = {
	_creationTime: number;
};

type DateGroup =
	| "Today"
	| "Yesterday"
	| "Last 7 Days"
	| "Last 30 Days"
	| "This Year"
	| "Older";

const DATE_GROUPS: DateGroup[] = [
	"Today",
	"Yesterday",
	"Last 7 Days",
	"Last 30 Days",
	"This Year",
	"Older",
];

function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function startOfYear(date: Date): Date {
	return new Date(date.getFullYear(), 0, 1);
}

function getDateGroup(chatTime: number, now: Date): DateGroup {
	const todayStart = startOfDay(now).getTime();
	const yesterdayStart = startOfDay(
		new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
	).getTime();
	const last7DaysStart = startOfDay(
		new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
	).getTime();
	const last30DaysStart = startOfDay(
		new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
	).getTime();
	const thisYearStart = startOfYear(now).getTime();

	if (chatTime >= todayStart) return "Today";
	if (chatTime >= yesterdayStart) return "Yesterday";
	if (chatTime >= last7DaysStart) return "Last 7 Days";
	if (chatTime >= last30DaysStart) return "Last 30 Days";
	if (chatTime >= thisYearStart) return "This Year";
	return "Older";
}

export function groupChatsByDate<T extends ChatWithCreationTime>(
	chats: T[],
	now: Date = new Date(),
): { group: DateGroup; chats: T[] }[] {
	const groups = new Map<DateGroup, T[]>();

	for (const chat of chats) {
		const group = getDateGroup(chat._creationTime, now);
		const existing = groups.get(group);
		if (existing) {
			existing.push(chat);
		} else {
			groups.set(group, [chat]);
		}
	}

	return DATE_GROUPS.filter((g) => groups.has(g)).map((g) => ({
		group: g,
		chats: groups.get(g)!,
	}));
}

export { DATE_GROUPS, type DateGroup };
