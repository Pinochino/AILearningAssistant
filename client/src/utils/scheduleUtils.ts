/**
 * Checks if two time ranges overlap
 * @param start1 Start time of first range in format 'HH:MM'
 * @param end1 End time of first range in format 'HH:MM'
 * @param start2 Start time of second range in format 'HH:MM'
 * @param end2 End time of second range in format 'HH:MM'
 * @returns boolean indicating if the time ranges overlap
 */
function doTimeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    // Convert 'HH:MM' to minutes since midnight for easier comparison
    const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const start1Min = toMinutes(start1);
    const end1Min = toMinutes(end1);
    const start2Min = toMinutes(start2);
    const end2Min = toMinutes(end2);

    return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Checks if two class schedules have any time conflicts
 * @param schedule1 First class schedule array
 * @param schedule2 Second class schedule array
 * @returns boolean indicating if there's a schedule conflict
 */
export function hasScheduleConflict(
    schedule1: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
    schedule2: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): boolean {
    // Create a map of day of week to time slots for faster lookup
    const schedule1Map = new Map<number, Array<{ startTime: string; endTime: string }>>();

    // Populate the map with first schedule
    schedule1.forEach((slot) => {
        if (!schedule1Map.has(slot.dayOfWeek)) {
            schedule1Map.set(slot.dayOfWeek, []);
        }
        schedule1Map.get(slot.dayOfWeek)?.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
        });
    });

    // Check each time slot in schedule2 against schedule1
    return schedule2.some((slot2) => {
        const daySchedule = schedule1Map.get(slot2.dayOfWeek);
        if (!daySchedule) return false;

        return daySchedule.some((slot1) =>
            doTimeRangesOverlap(
                slot1.startTime,
                slot1.endTime,
                slot2.startTime,
                slot2.endTime
            )
        );
    });
}

/**
 * Finds conflicting classes from a list of enrolled classes
 * @param targetClass The class to check for conflicts
 * @param enrolledClasses List of already enrolled classes
 * @returns Array of class names that conflict with the target class
 */
export function findConflictingClasses(
    targetClass: { _id: string; name: string; schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string }> },
    enrolledClasses: Array<{ classId: { _id: string; name: string; schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string }> } }>
): string[] {
    const conflicts: string[] = [];

    enrolledClasses.forEach((enrolled) => {
        if (enrolled.classId._id === targetClass._id) return; // Skip self-comparison

        if (hasScheduleConflict(targetClass.schedule, enrolled.classId.schedule)) {
            conflicts.push(enrolled.classId.name);
        }
    });

    return conflicts;
}