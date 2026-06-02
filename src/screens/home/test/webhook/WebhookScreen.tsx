// app/webhook/index.tsx or wherever you're using Webhook
import React from "react";
import WebhookScreen from "../../../../core/components/home/test/webhook/Webhook";
import { useNavigation } from "@react-navigation/native";

export default function Webhook() {
  const navigation = useNavigation();
  return <WebhookScreen navigation={navigation} />;
}
