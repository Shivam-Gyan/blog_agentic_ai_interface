'use client'
import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/stores/conversationStore";
import { useRouter } from "next/navigation";



const page = () => {

  const router = useRouter();

  const createConversation = useConversationStore(s=> s.createConversation);
  const setCurrentThreadId = useConversationStore(s=> s.setCurrentThread);


  const handleClick = () => {
    const threadId = createConversation("New Chat");
    setCurrentThreadId(threadId);
    router.push(`/chat/${threadId}`);
  };
  return (
    <>
      <div>page</div>
      <Button onClick={handleClick}>Go to Chat</Button>
    </>
  )
}

export default page