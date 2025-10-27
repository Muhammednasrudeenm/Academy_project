import Group from "../models/Group.js";

export const getGroups = async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
};

export const createGroup = async (req, res) => {
  const group = await Group.create(req.body);
  res.status(201).json(group);
};

export const getGroupById = async (req, res) => {
  const group = await Group.findById(req.params.id);
  res.json(group);
};

export const joinGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group.members.includes(req.body.userId)) {
    group.members.push(req.body.userId);
  }
  await group.save();
  res.json(group);
};
