import { responseReturn } from "../../utils/response.js";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import Agent from "../../models/Agent.js";

export const addAgent = async (req, res) => {
  const { id } = req;
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    let {
      name,
      shortInfo,
      description,
      pricePerMonth,
      pricePerHour,
      service1,
      service2,
      service3,
      benefit1,
      benefit2,
      benefit3,
      tech1,
      tech2,
      tech3,
      agencyName,
      department,
    } = field;
    let { images } = files;
    name = name.trim();
    const slug = name.split(" ").join("-");

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      let allImageUrl = [];

      if (!Array.isArray(images)) {
        images = [images];
      }

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i].filepath, {
          folder: "agents",
        });
        allImageUrl.push(result.url);
      }

      await Agent.create({
        sellerId: id,
        name,
        slug,
        agencyName,
        department: department.trim(),
        description: description.trim(),
        shortInfo: shortInfo.trim(),
        pricePerMonth: parseInt(pricePerMonth),
        pricePerHour: parseInt(pricePerHour),
        services: {
          service1,
          service2,
          service3,
        },
        benefits: {
          benefit1,
          benefit2,
          benefit3,
        },
        techs: {
          tech1,
          tech2,
          tech3,
        },
        images: allImageUrl,
      });

      responseReturn(res, 201, { message: "Agent Added Successfully" });
    } catch (error) {
      responseReturn(res, 500, { message: error.message });
      console.log(error.message);
    }
  });
};

export const getAgents = async (req, res) => {
  const { page, searchValue, parPage } = req.query;
  const { id } = req;

  const skipPage = parseInt(parPage) * (parseInt(page) - 1);

  try {
    if (searchValue) {
      const agents = await Agent.find({
        $text: { $search: searchValue },
        sellerId: id,
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });
      const totalAgent = await Agent.find({
        $text: { $search: searchValue },
        sellerId: id,
      }).countDocuments();
      responseReturn(res, 200, { agents, totalAgent });
    } else {
      const agents = await Agent.find({ sellerId: id })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });
      const totalAgent = await Agent.find({ sellerId: id }).countDocuments();
      responseReturn(res, 200, { agents, totalAgent });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const getAgent = async (req, res) => {
  const { agentId } = req.params;

  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      responseReturn(res, 404, { error: "Agent doesn't exist" });
    }
    responseReturn(res, 200, { agent });
  } catch (error) {
    console.log(error.message);
  }
};

export const getAgentProfile = async (req, res) => {
  const { agentId } = req.params;

  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      responseReturn(res, 404, { error: "Agent doesn't exist" });
    }
    responseReturn(res, 200, { agent });
  } catch (error) {
    console.log(error.message);
  }
};

export const getAgentProfileSeller = async (req, res) => {
  const { agentId } = req.params;

  try {
    const agent = await Agent.findById(agentId);
    if (!agent) {
      responseReturn(res, 404, { error: "Agent doesn't exist" });
    }
    responseReturn(res, 200, { agent });
  } catch (error) {
    console.log(error.message);
  }
};

export const updateAgent = async (req, res) => {
  const { id } = req;
  let {
    name,
    shortInfo,
    description,
    pricePerMonth,
    pricePerHour,
    service1,
    service2,
    service3,
    benefit1,
    benefit2,
    benefit3,
    tech1,
    tech2,
    tech3,
    agencyName,
    agentId,
    department,
  } = req.body;

  try {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      return responseReturn(res, 404, { error: "Agent not found" });
    }

    if (agent.sellerId.toString() !== id) {
      return responseReturn(res, 403, {
        error: "Unauthorized: You cannot update this agent",
      });
    }

    name = name.trim();
    const slug = name.split(" ").join("-");

    try {
      await Agent.findByIdAndUpdate(agentId, {
        name,
        shortInfo,
        description,
        pricePerMonth,
        pricePerHour,
        services: {
          service1,
          service2,
          service3,
        },
        benefits: {
          benefit1,
          benefit2,
          benefit3,
        },
        techs: {
          tech1,
          tech2,
          tech3,
        },
        agencyName,
        department,
      });

      const agent = await Agent.findById(agentId);
      responseReturn(res, 200, {
        agent,
        message: "Agent Updated Successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const updateAgentImage = async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, field, files) => {
    const { oldImage, agentId } = field;
    const { newImage } = files;

    if (err) {
      responseReturn(res, 400, { error: err.message });
    } else {
      try {
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        const result = await cloudinary.uploader.upload(newImage.filepath, {
          folder: "agents",
        });

        if (result) {
          let { images } = await Agent.findById(agentId);
          const index = images.findIndex((img) => img === oldImage);
          images[index] = result.url;
          await Agent.findByIdAndUpdate(agentId, { images });

          const agent = await Agent.findById(agentId);
          responseReturn(res, 200, {
            agent,
            message: "Agent Image Updated Successfully",
          });
        } else {
          responseReturn(res, 404, { error: "Agent Image Upload Failed" });
        }
      } catch (error) {
        responseReturn(res, 404, { error: error.message });
      }
    }
  });
};

export const deleteAgent = async (req, res) => {
  try {
    const { agentId, userId } = req.body;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return responseReturn(res, 404, { error: "Agent not found" });
    }

    if (agent.sellerId.toString() !== userId) {
      return responseReturn(res, 403, {
        error: "Unauthorized: You cannot delete this agent",
      });
    }

    try {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      if (agent.images && agent.images.length > 0) {
        for (const imageUrl of agent.images) {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`agents/${publicId}`);
        }
      }

      await Agent.findByIdAndDelete(agentId);

      responseReturn(res, 200, { message: "Agent deleted successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};
