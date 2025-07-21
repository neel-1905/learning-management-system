"use client";

import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import soundwaves from "@/constants/soundwaves.json";

enum CallStatus {
  IDLE = "IDLE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  FINISHED = "FINISHED",
}

const CompanionComponent = ({
  companionId,
  userName,
  userImage,
  subject,
  topic,
  style,
  voice,
  name,
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  console.log(isMuted);

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setIsMuted(vapi.isMuted());
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType == "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  const toggleMicrophone = () => {
    if (callStatus === CallStatus.ACTIVE) {
      // Check if the call is active
      const isMuted = vapi.isMuted();
      vapi.setMuted(!isMuted);
      setIsMuted(!isMuted);
    } else {
      console.log("Cannot toggle microphone: No active call.");
    }
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    // @ts-expect-error
    vapi.start(configureAssistant(voice, style), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
    setIsMuted(true);
  };

  return (
    <section className="flex flex-col h-screen">
      <section className="flex gap-8 max-sm:flex-col">
        <div className="companion-section">
          <div
            className="companion-avatar"
            style={{
              backgroundColor: getSubjectColor(subject),
            }}
          >
            <div
              className={cn(
                `absolute transition-opacity duration-1000`,
                callStatus === CallStatus.FINISHED ||
                  callStatus === CallStatus.INACTIVE
                  ? "opacity-100"
                  : `opacity-0`,
                callStatus === CallStatus.CONNECTING &&
                  "opacity-100 animate-pulse"
              )}
            >
              <Image
                src={`/icons/${subject}.svg`}
                alt={subject}
                width={150}
                height={150}
                className="max-sm:w-fit"
              />
            </div>

            <div
              className={cn(
                `absolute transition-opacity duration-1000`,
                callStatus === CallStatus.ACTIVE ? "opacity-100" : `opacity-0`
              )}
            >
              <Lottie
                lottieRef={lottieRef}
                animationData={soundwaves}
                autoPlay={false}
                className="companion-lottie"
              />
            </div>
          </div>

          <p className="font-bold text-2xl">{name}</p>
        </div>

        <div className="user-section">
          <div className="user-avatar">
            <Image
              src={userImage}
              alt={userName}
              width={130}
              height={130}
              className="rounded-lg"
            />

            <p className="font-bold text-2xl">{userName}</p>
          </div>

          <button
            className="btn-mic"
            disabled={
              callStatus === CallStatus.FINISHED ||
              callStatus === CallStatus.INACTIVE
            }
            onClick={toggleMicrophone}
          >
            <Image
              src={isMuted ? `/icons/mic-off.svg` : `/icons/mic-on.svg`}
              alt="Mic"
              height={36}
              width={36}
            />
            <p className="max-sm:hidden">
              {isMuted ? `Turn on mic` : `Turn off mic`}
            </p>
          </button>

          <button
            className={cn(
              `rounded-lg py-2 cursor-pointer transition-colors w-full text-white`,
              callStatus === CallStatus.ACTIVE ? "bg-red-700" : `bg-primary`,
              callStatus === CallStatus.CONNECTING && `animate-pulse`
            )}
            onClick={
              callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
            }
          >
            {callStatus === CallStatus.ACTIVE
              ? "End Session"
              : callStatus === CallStatus.CONNECTING
              ? `Connecting`
              : `Start session`}
          </button>
        </div>
      </section>

      <section className="transcript ">
        <div className="transcript-message no-scrollbar">
          {messages.map((message, index) => {
            if (message.role === "assistant") {
              return (
                <p key={message.content} className="max-sm:text-sm">
                  {message.content}: {name.split(" ")[0].replace(/[.,]/g, "")}
                </p>
              );
            } else {
              return (
                <p
                  key={message.content}
                  className="text-primary max-sm:text-sm"
                >
                  {userName}: {message.content}
                </p>
              );
            }
          })}
        </div>

        <div className="transcript-fade" />
      </section>
    </section>
  );
};

export default CompanionComponent;
