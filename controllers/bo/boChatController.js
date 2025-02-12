import BO from "../../models/BO.js";
import SellerCustomerMessage from "../../models/chat/SellerCustomerMessage.js";
import SellerCustomer from "../../models/chat/SellerCustomerModel.js";
import Seller from "../../models/Seller.js";
import { responseReturn } from "./../../utils/response.js";

export const add_bo_friend = async (req, res) => {
  const { sellerId, userId } = req.body;

  try {
    if (sellerId !== "") {
      const seller = await Seller.findById(sellerId);
      const user = await BO.findById(userId);
      const checkSeller = await SellerCustomer.findOne({
        $and: [
          {
            myId: {
              $eq: userId,
            },
          },
          {
            myFriends: {
              $elemMatch: {
                fdId: sellerId,
              },
            },
          },
        ],
      });

      if (!checkSeller) {
        await SellerCustomer.updateOne(
          {
            myId: userId,
          },
          {
            $push: {
              myFriends: {
                fdId: sellerId,
                name: seller.agencyInfo?.name,
                image: seller.agencyInfo?.agencyLogo[0],
              },
            },
          }
        );
      }

      const checkBO = await SellerCustomer.findOne({
        $and: [
          {
            myId: {
              $eq: sellerId,
            },
          },
          {
            myFriends: {
              $elemMatch: {
                fdId: userId,
              },
            },
          },
        ],
      });

      if (!checkBO) {
        await SellerCustomer.updateOne(
          {
            myId: sellerId,
          },
          {
            $push: {
              myFriends: {
                fdId: userId,
                name: user.businessInfo?.name,
                image: user.businessInfo?.businessLogo[0],
              },
            },
          }
        );
      }

      const messages = await SellerCustomerMessage.find({
        $or: [
          {
            $and: [
              {
                receiverId: { $eq: sellerId },
              },
              {
                senderId: {
                  $eq: userId,
                },
              },
            ],
          },
          {
            $and: [
              {
                receiverId: { $eq: userId },
              },
              {
                senderId: {
                  $eq: sellerId,
                },
              },
            ],
          },
        ],
      });

      const MyFriends = await SellerCustomer.findOne({
        myId: userId,
      });

      const currentFd = MyFriends.myFriends.find((s) => s.fdId === sellerId);

      responseReturn(res, 200, {
        MyFriends: MyFriends.myFriends,
        currentFd,
        messages,
      });
    } else {
      const MyFriends = await SellerCustomer.findOne({
        myId: userId,
      });

      responseReturn(res, 200, {
        MyFriends: MyFriends.myFriends,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const bo_message_add = async (req, res) => {
  const { userId, text, sellerId, name } = req.body;

  try {
    const message = await SellerCustomerMessage.create({
      senderId: userId,
      senderName: name,
      receiverId: sellerId,
      message: text,
    });

    const data = await SellerCustomer.findOne({ myId: userId });
    let myFriends = data.myFriends;
    let index = myFriends.findIndex((f) => f.fdId === sellerId);
    while (index > 0) {
      let temp = myFriends[index];
      myFriends[index] = myFriends[index - 1];
      myFriends[index - 1] = temp;
      index--;
    }
    await SellerCustomer.updateOne(
      {
        myId: userId,
      },
      { myFriends }
    );

    const data1 = await SellerCustomer.findOne({ myId: sellerId });
    let myFriends1 = data1.myFriends;
    let index1 = myFriends1.findIndex((f) => f.fdId === userId);
    while (index1 > 0) {
      let temp = myFriends1[index1];
      myFriends1[index1] = myFriends[index1 - 1];
      myFriends1[index1 - 1] = temp;
      index1--;
    }
    await SellerCustomer.updateOne(
      {
        myId: sellerId,
      },
      { myFriends1 }
    );

    responseReturn(res, 201, { message });
  } catch (error) {
    console.log(error);
  }
};
