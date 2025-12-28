import Label from "../models/label.model.js";

const handleLabels = async (labels, userId) => {
  if (!Array.isArray(labels) || labels.length === 0) {
    return [];
  }

  const labelIds = [];

  for (const labelName of labels) {
    const normalizedName = labelName.trim().toLowerCase();

    let label = await Label.findOne({
      name: normalizedName,
      userId,
    });

    if (!label) {
      label = await Label.create({
        name: normalizedName,
        userId,
      });
    }
    labelIds.push(label._id);
  }
  return labelIds;
};

export default handleLabels;
