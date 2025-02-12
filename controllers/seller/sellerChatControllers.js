import BO from "../../models/BO.js";
import SellerCustomerMessage from "../../models/chat/SellerCustomerMessage.js";
import SellerCustomer from "../../models/chat/SellerCustomerModel.js";
import { responseReturn } from "../../utils/response.js";

export const getBOs = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const data = await SellerCustomer.findOne({
      myId: sellerId,
    });
    responseReturn(res, 200, {
      bos: data.myFriends,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getBOSellerMessage = async (req, res) => {
  const { id } = req;
  const { boId } = req.params;

  try {
    const messages = await SellerCustomerMessage.find({
      $or: [
        {
          $and: [
            {
              receiverId: { $eq: boId },
            },
            {
              senderId: {
                $eq: id,
              },
            },
          ],
        },
        {
          $and: [
            {
              receiverId: { $eq: id },
            },
            {
              senderId: {
                $eq: boId,
              },
            },
          ],
        },
      ],
    });

    const currentBO = await BO.findById(boId);

    responseReturn(res, 200, {
      messages,
      currentBO,
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendMessageToBO = async (req, res) => {
  const { senderId, receiverId, text, name } = req.body;

  try {
    const message = await SellerCustomerMessage.create({
      senderId: senderId,
      senderName: name,
      receiverId: receiverId,
      message: text,
    });

    const data = await SellerCustomer.findOne({ myId: senderId });
    let myFriends = data.myFriends;
    let index = myFriends.findIndex((f) => f.fdId === receiverId);
    while (index > 0) {
      let temp = myFriends[index];
      myFriends[index] = myFriends[index - 1];
      myFriends[index - 1] = temp;
      index--;
    }
    await SellerCustomer.updateOne(
      {
        myId: senderId,
      },
      { myFriends }
    );

    const data1 = await SellerCustomer.findOne({ myId: receiverId });
    let myFriends1 = data1.myFriends;
    let index1 = myFriends1.findIndex((f) => f.fdId === senderId);
    while (index1 > 0) {
      let temp = myFriends1[index1];
      myFriends1[index1] = myFriends[index1 - 1];
      myFriends1[index1 - 1] = temp;
      index1--;
    }
    await SellerCustomer.updateOne(
      {
        myId: receiverId,
      },
      { myFriends1 }
    );

    responseReturn(res, 201, { message });
  } catch (error) {
    console.log(error)
  }
};
