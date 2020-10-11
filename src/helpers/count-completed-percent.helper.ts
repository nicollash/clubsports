function countCompletedPercent<T extends object>(
  arr: T[],
  completedField: string
): number {
  const completedItems = arr.reduce(
    (acc, it) => ({
      shouldCompleted: it.hasOwnProperty(completedField)
        ? acc.shouldCompleted + 1
        : acc.shouldCompleted,
      completed:
        it.hasOwnProperty(completedField) && it[completedField]
          ? acc.completed + 1
          : acc.completed,
    }),
    { shouldCompleted: 0, completed: 0 }
  );

  return Math.ceil(
    (completedItems.completed / completedItems.shouldCompleted) * 100
  );
}

export { countCompletedPercent };
