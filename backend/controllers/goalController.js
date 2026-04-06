import Goal from "../models/Goal.js";

const IST_OFFSET = "+05:30";

const calculateMonthDifference = (fromDate, toDate) => {
  const yearDiff = toDate.getFullYear() - fromDate.getFullYear();
  const monthDiff = toDate.getMonth() - fromDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;

  if (toDate.getDate() > fromDate.getDate()) {
    return totalMonths + 1;
  }

  return totalMonths <= 0 ? 1 : totalMonths;
};

const serializeGoal = (goal) => {
  const plain = typeof goal.toObject === "function" ? goal.toObject() : goal;
  const currentSaved = Number(plain.currentSaved || 0);
  const targetAmount = Number(plain.targetAmount || 0);
  const remainingAmount = Math.max(targetAmount - currentSaved, 0);
  const today = new Date();
  const targetDate = new Date(plain.targetDate);
  const monthsRemaining = calculateMonthDifference(today, targetDate);
  const monthlyRequired = remainingAmount > 0 ? remainingAmount / Math.max(monthsRemaining, 1) : 0;
  const progressPercent = targetAmount > 0 ? Math.min((currentSaved / targetAmount) * 100, 100) : 0;

  return {
    ...plain,
    remainingAmount: Number(remainingAmount.toFixed(2)),
    monthsRemaining,
    monthlyRequired: Number(monthlyRequired.toFixed(2)),
    progressPercent: Number(progressPercent.toFixed(2)),
  };
};

export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentSaved = 0, targetDate, notes = "" } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ message: "Title, target amount and target date are required" });
    }

    const parsedTargetAmount = Number(targetAmount);
    const parsedCurrentSaved = Number(currentSaved);
    const parsedTargetDate = new Date(`${targetDate}T00:00:00${IST_OFFSET}`);

    if (!Number.isFinite(parsedTargetAmount) || parsedTargetAmount <= 0) {
      return res.status(400).json({ message: "Target amount must be greater than 0" });
    }

    if (!Number.isFinite(parsedCurrentSaved) || parsedCurrentSaved < 0) {
      return res.status(400).json({ message: "Current saved amount must be 0 or more" });
    }

    if (parsedCurrentSaved > parsedTargetAmount) {
      return res.status(400).json({ message: "Already saved amount cannot be greater than the target amount" });
    }

    if (Number.isNaN(parsedTargetDate.getTime())) {
      return res.status(400).json({ message: "Invalid target date" });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title,
      targetAmount: parsedTargetAmount,
      currentSaved: parsedCurrentSaved,
      targetDate: parsedTargetDate,
      notes,
    });

    return res.status(201).json({
      message: "Goal created successfully",
      goal: serializeGoal(goal),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ targetDate: 1, createdAt: -1 });

    return res.json({
      goals: goals.map(serializeGoal),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const updates = { ...req.body };
    const existingGoal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });

    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (updates.targetAmount !== undefined) {
      const value = Number(updates.targetAmount);
      if (!Number.isFinite(value) || value <= 0) {
        return res.status(400).json({ message: "Target amount must be greater than 0" });
      }
      updates.targetAmount = value;
    }

    if (updates.currentSaved !== undefined) {
      const value = Number(updates.currentSaved);
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ message: "Current saved amount must be 0 or more" });
      }
      updates.currentSaved = value;
    }

    const nextTargetAmount = updates.targetAmount ?? existingGoal.targetAmount;
    const nextCurrentSaved = updates.currentSaved ?? existingGoal.currentSaved;

    if (nextCurrentSaved > nextTargetAmount) {
      return res.status(400).json({ message: "Already saved amount cannot be greater than the target amount" });
    }

    if (updates.targetDate) {
      const parsed = new Date(`${updates.targetDate}T00:00:00${IST_OFFSET}`);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ message: "Invalid target date" });
      }
      updates.targetDate = parsed;
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Goal updated successfully",
      goal: serializeGoal(goal),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
