
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { getChatbotResponse } from '@/app/chatbot/actions';
import { useToast } from "@/hooks/use-toast";
import { generateId } from '@/lib/localStorage';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: ChatMessage = {
      id: generateId(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const result = await getChatbotResponse({ userQuery: userMessage.text });
    setIsLoading(false);

    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Chatbot Error', description: result.error });
      const errorMessage: ChatMessage = {
        id: generateId(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } else {
      const botMessage: ChatMessage = {
        id: generateId(),
        text: result.aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  // Add initial greeting message when dialog opens and messages are empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          text: "Hello! I'm PlatePilot AI. How can I help you with your health, diet, or food management questions today?",
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
    }
  }, [isOpen, messages.length]);


  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <Bot className="h-7 w-7" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 flex flex-col h-[70vh] max-h-[600px]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> PlatePilot AI</DialogTitle>
            <DialogDescription>Ask me anything about health, diet, or food management.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />}
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-2">
                 <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm shadow flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Typing...
                </div>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" onClick={handleSendMessage} disabled={isLoading || inputValue.trim() === ''}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
