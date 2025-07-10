
-- Create agent conversations table
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Create agent messages table
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Update agent_training_data table to support question_answer type
ALTER TABLE public.agent_training_data 
DROP CONSTRAINT IF EXISTS agent_training_data_data_type_check;

ALTER TABLE public.agent_training_data 
ADD CONSTRAINT agent_training_data_data_type_check 
CHECK (data_type IN ('file', 'link', 'manual_prompt', 'question_answer'));

-- Enable Row Level Security
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.agent_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.agent_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.agent_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.agent_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for agent_messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.agent_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations 
    WHERE id = agent_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.agent_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_conversations 
    WHERE id = agent_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their conversations" 
ON public.agent_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations 
    WHERE id = agent_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their conversations" 
ON public.agent_messages 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations 
    WHERE id = agent_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- Create function to update timestamps for conversations
CREATE OR REPLACE FUNCTION public.update_agent_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps for messages
CREATE OR REPLACE FUNCTION public.update_agent_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agent_conversations_updated_at
BEFORE UPDATE ON public.agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_conversations_updated_at();

CREATE TRIGGER update_agent_messages_updated_at
BEFORE UPDATE ON public.agent_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_messages_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_status ON public.agent_conversations(status);
CREATE INDEX idx_agent_messages_conversation_id ON public.agent_messages(conversation_id);
CREATE INDEX idx_agent_messages_role ON public.agent_messages(role);
