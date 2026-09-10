import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { LearnDetailContent } from "@/components/marketing/learn-detail-content"

interface LearnTopic {
  title: string
  content: string[]
}

interface LearnCategory {
  slug: string
  title: string
  description: string
  color: string
  iconBg: string
  topics: LearnTopic[]
}

const categories: Record<string, LearnCategory> = {
  purpose: {
    slug: "purpose",
    title: "Purpose",
    description: "Finding your purpose and clarifying what matters most.",
    color: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
    iconBg: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
    topics: [
      {
        title: "What Is Purpose?",
        content: [
          "Purpose is the deeper reason behind the direction you choose for your life. It is not a goal to achieve or a task to complete. It is a持续 sense of meaning that guides your decisions and actions.",
          "Unlike goals, which are specific outcomes you work toward, purpose is a持续 state of being. It does not change when circumstances shift. Goals can be achieved, but purpose is something you live through daily.",
          "When you know your purpose, decisions become clearer. You stop second-guessing yourself. You stop living by default and start living by design. Purpose gives every action weight and meaning.",
          "At Intent&eacute;o, we believe purpose is not something you find once and forget. It is something you return to, refine, and live through every single day.",
        ],
      },
      {
        title: "Why Purpose Matters",
        content: [
          "Productivity without purpose is just motion. You can complete every task on your list and still end the day feeling empty if those tasks are not connected to something meaningful.",
          "Research shows that people with a clear sense of purpose are more resilient, more motivated, and more satisfied with their lives. They do not just accomplish more. They accomplish the right things.",
          "Purpose acts as a compass. When you are faced with a decision, your purpose tells you which direction to go. Without it, every choice feels equally important and equally overwhelming.",
          "The most productive people are not always the happiest. But the most intentional ones usually are. That is the difference purpose makes.",
        ],
      },
      {
        title: "Purpose vs Goals",
        content: [
          "Goals are destinations. Purpose is the compass. You can reach every goal on your list and still feel lost if those goals were not guided by something deeper.",
          "Purpose is your north star. It is the reason you do what you do. It does not change when circumstances shift. Goals, on the other hand, are specific outcomes you are working toward. They are important, but they are not the point.",
          "When you set goals without purpose, they feel like obligations. You grind through them, check the box, and wonder why it did not feel like enough. But when a goal is anchored to your purpose, every step forward feels meaningful.",
          "The distinction matters because purpose gives goals their shape. Without it, you are just collecting achievements. With it, you are building a life.",
        ],
      },
      {
        title: "Discovering Your Purpose",
        content: [
          "Start with a simple exercise. Set a timer for 30 minutes. Write down the moments in your life when you felt most alive, most proud, most yourself. Then look for patterns.",
          "What were you doing? Who were you with? What mattered in those moments? Those patterns point to your values. And your values point to your purpose.",
          "Your purpose does not have to be grand or dramatic. It can be as simple as I help people feel understood or I create things that make life easier. What matters is that it resonates with the real you.",
          "Write your purpose down. Put it somewhere you will see it daily. Return to it when you feel lost. Purpose is not a one-time exercise. It is a living practice.",
        ],
      },
      {
        title: "Clarifying Your Values",
        content: [
          "Your values are the principles that guide your decisions. They are what you stand for when no one is watching. But most people have never taken the time to name them clearly.",
          "When you know your values, saying yes and no becomes easier. You stop second-guessing. You stop living by default and start living by design.",
          "Values are not a one-time exercise. They evolve as you grow. Return to them regularly. Ask yourself: Do these still resonate? Am I living according to them?",
          "Intent&eacute;o helps you document and return to these values regularly. Because values are not a one-time exercise. They are a living practice.",
        ],
      },
      {
        title: "Living According to Your Values",
        content: [
          "Finding your purpose is the first step. Living it daily is the real practice. This means aligning your actions, habits, and goals with what you have identified as meaningful.",
          "Start small. Each morning, ask yourself: What is one thing I can do today that aligns with my purpose? It does not have to be dramatic. Even small, intentional actions compound over time.",
          "Track your alignment. Intent&eacute;o helps you measure how well your daily actions match your intentions. Over weeks and months, patterns emerge that guide meaningful change.",
          "Remember: living your purpose does not mean every day feels perfect. It means every day feels connected. Even hard days have meaning when they are aligned with what matters.",
        ],
      },
      {
        title: "Connecting Purpose to Daily Actions",
        content: [
          "Purpose without action is just a nice idea. The real power of purpose comes when it shapes your daily choices. From what you work on to how you spend your free time.",
          "Each morning, identify one action that aligns with your purpose. It could be a conversation, a creative project, a act of service, or simply showing up with intention.",
          "Over time, these small actions build a life that reflects your values. That is the Inteéntéo way. Purpose informs vision. Vision shapes goals. Goals drive daily actions.",
          "The chain of connection is what makes intentional living possible. And it starts with knowing your purpose.",
        ],
      },
    ],
  },
  vision: {
    slug: "vision",
    title: "Vision",
    description: "Creating a meaningful vision and thinking long-term.",
    color: "bg-purple-500/10 text-purple-600",
    iconBg: "bg-purple-500/10 text-purple-600",
    topics: [
      {
        title: "What Is a Personal Vision?",
        content: [
          "Vision is the picture of the life you want to live. It is bigger than goals. It is the overall direction you want your life to go. While goals are destinations, vision is the landscape.",
          "A clear vision helps you see beyond the immediate. It gives context to your daily actions and helps you prioritize what truly matters. Without vision, you are just checking boxes.",
          "Your vision is not something you achieve. It is something you pursue. It evolves as you grow. The point is not to reach a final destination, but to move consistently in a direction that matters.",
          "At Intent&eacute;o, vision sits between purpose and goals. It translates your deep why into a tangible picture of what your life could look like.",
        ],
      },
      {
        title: "Why Create a Long-Term Vision?",
        content: [
          "Without vision, you are reactive. You respond to whatever comes your way, letting urgency dictate your priorities. With vision, you are proactive. You choose your direction and move toward it intentionally.",
          "Vision creates motivation. When you can see where you are going, the daily grind feels purposeful. Each small step becomes meaningful because it is part of something bigger.",
          "Vision also creates resilience. When setbacks happen and they will, a clear vision helps you recover. You know why you are doing this, so you keep going.",
          "People with a clear vision report higher levels of satisfaction, lower levels of stress, and a stronger sense of control over their lives.",
        ],
      },
      {
        title: "Vision vs Goals",
        content: [
          "Vision is the destination. Goals are the milestones along the way. Vision tells you where you want to end up. Goals tell you what you need to do next.",
          "A vision without goals is just a dream. Goals without vision are just tasks. You need both. Vision provides direction. Goals provide structure.",
          "When you set goals without vision, they feel disconnected. You accomplish things but do not feel satisfied. When you have vision, every goal feels like progress toward something meaningful.",
          "The best goals are the ones that move you closer to your vision. Ask yourself: Does this goal serve my bigger picture?",
        ],
      },
      {
        title: "Creating a 10-Year Vision",
        content: [
          "Start by imagining your ideal life ten years from now. Do not limit yourself. What does a typical day look like? Who are you with? What work are you doing? What does your environment feel like?",
          "Write it down in present tense, as if it is already happening. I wake up feeling rested. I spend the morning with my family. I do work that matters. I end the day with reflection.",
          "Now connect it to your purpose. Does this vision align with what you have identified as meaningful? If not, adjust. Vision without purpose is just fantasy.",
          "Share your vision with someone you trust. Saying it out loud makes it real. And keep it visible. Return to it regularly to stay connected.",
        ],
      },
      {
        title: "Imagining Your Ideal Future",
        content: [
          "Do not just think about what you want to do. Think about who you want to be. What kind of person do you want to become? What relationships do you want to have? What impact do you want to make?",
          "Your ideal future is not just about achievement. It is about fulfillment. What does a satisfying day feel like? What does a meaningful week look like?",
          "Write about your ideal future in detail. The more vivid it is, the more motivating it becomes. Include sensory details. What do you see, hear, feel?",
          "Return to this vision regularly. As you grow, your vision will evolve. That is not a problem. It is a sign of progress.",
        ],
      },
      {
        title: "Connecting Vision to Purpose",
        content: [
          "Your vision should be a natural expression of your purpose. If your purpose is to help people feel understood, your vision might include deep relationships and meaningful work.",
          "When vision and purpose are aligned, motivation becomes internal. You do not need external pressure to stay on track. The vision pulls you forward because it represents something you genuinely care about.",
          "If your vision feels disconnected from your purpose, revisit your purpose statement. What matters most to you? How does that translate into a picture of your ideal life?",
          "The chain of connection is: Purpose informs Vision. Vision shapes Goals. Goals drive Daily Actions. This is the Inteéntéo framework.",
        ],
      },
      {
        title: "Turning Vision Into Direction",
        content: [
          "Vision is not something you create once and file away. It is something you return to daily. Each morning, ask: What is one thing I can do today that moves me toward my vision?",
          "Break your vision into smaller milestones. Where do you want to be in one year? In six months? In three months? These milestones become your goals.",
          "Track your progress. Intent&eacute.o helps you see how each task and habit contributes to the bigger picture.",
          "Remember: vision is a direction, not a destination. It is okay if the picture changes. What matters is that you are moving intentionally toward something meaningful.",
        ],
      },
    ],
  },
  goals: {
    slug: "goals",
    title: "Goals",
    description: "Setting meaningful goals and tracking progress.",
    color: "bg-blue-500/10 text-blue-600",
    iconBg: "bg-blue-500/10 text-blue-600",
    topics: [
      {
        title: "What Makes a Goal Meaningful?",
        content: [
          "Meaningful goals are goals that connect to your purpose. They are not just items on a checklist. They are expressions of what matters to you. When a goal is tied to your why, motivation becomes internal.",
          "The problem with most goal-setting frameworks is that they optimize for completion, not meaning. A goal can be perfectly structured and still feel hollow if it is not connected to something deeper.",
          "Meaningful goals start with a question: Why does this matter to me? Not to your boss, not to social media, not to the version of yourself you think you should be. But to the real you.",
          "At Intent&eacute;o, goals are not isolated lists. They connect upward to your vision and purpose, and downward to your daily tasks and habits.",
        ],
      },
      {
        title: "Goals vs Purpose",
        content: [
          "Goals are destinations. Purpose is the compass. You can reach every goal on your list and still feel lost if those goals were not guided by something deeper.",
          "Purpose is your north star. It is the reason you do what you do. Goals are specific outcomes you are working toward. They are important, but they are not the point.",
          "When you set goals without purpose, they feel like obligations. You grind through them, check the box, and wonder why it did not feel like enough.",
          "But when a goal is anchored to your purpose, every step forward feels meaningful. That is the difference.",
        ],
      },
      {
        title: "Setting Effective Goals",
        content: [
          "SMART goals are everywhere. Specific, Measurable, Achievable, Relevant, Time-bound. But there is a problem: they optimize for completion, not meaning.",
          "A SMART goal can be perfectly structured and still feel hollow. Read 50 books this year is specific and measurable. But if you are reading to check a box rather than to learn, what is the point?",
          "The missing ingredient is purpose. Goals should start with why, not what. Why does this goal matter to you? What will change in your life if you achieve it?",
          "SMART goals are not wrong. They are just incomplete. Add purpose, and they become transformative.",
        ],
      },
      {
        title: "Breaking Goals Into Milestones",
        content: [
          "A big goal without milestones is just a wish. Write a book is overwhelming. Write 300 words today is doable. The secret to achieving big things is making them small enough to start.",
          "Start with the goal. Then ask: what is the smallest action I can take today that moves me forward? Not the biggest. The smallest. That is your daily action.",
          "This works because of compounding. 300 words a day is a book in six months. A 15-minute walk a day is a marathon in a year. Small actions, repeated consistently, produce extraordinary results.",
          "Intent&eacute.o helps you connect your big goals to your daily tasks. Every morning, you see which tasks move your goals forward.",
        ],
      },
      {
        title: "Connecting Goals to Your Vision",
        content: [
          "Every goal should serve your bigger picture. If a goal does not move you closer to your vision, ask yourself why you are pursuing it.",
          "When goals are connected to vision, motivation shifts. You no longer need external pressure to stay on track. The goal pulls you forward because it represents something you genuinely care about.",
          "Review your goals regularly. Ask: Is this still meaningful? Am I making progress? Do I need to adjust?",
          "The best goals are the ones that feel like natural steps toward your vision. They do not feel like obligations. They feel like progress.",
        ],
      },
      {
        title: "Tracking Progress",
        content: [
          "What gets measured gets managed. But measuring the wrong things leads to the wrong results. Do not just track completion. Track alignment.",
          "Ask yourself regularly: Is this goal still meaningful to me? If the answer is yes, keep going. If it is no, it might be time to adjust or let go.",
          "Intent&eacute.o considers progress, deadline alignment, habit consistency, and project completion. It gives you a holistic view of how your goals are doing.",
          "Celebrate milestones along the way. Each step forward is worth acknowledging. The compound effect of small wins is powerful.",
        ],
      },
      {
        title: "Reviewing and Adjusting Goals",
        content: [
          "Goals are not set in stone. They should evolve as you grow. What felt important six months ago might not matter as much today. That is okay.",
          "Schedule regular goal reviews. Monthly or quarterly. Ask: What is working? What is not? What needs to change?",
          "Let go of goals that no longer serve you. Holding onto outdated goals creates clutter and confusion. Release them with gratitude for what they taught you.",
          "The best goal system is one that adapts to your life. Rigid systems break. Flexible systems grow with you.",
        ],
      },
    ],
  },
  habits: {
    slug: "habits",
    title: "Habits",
    description: "Building habits that last through identity and consistency.",
    color: "bg-emerald-500/10 text-emerald-600",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    topics: [
      {
        title: "What Is a Habit?",
        content: [
          "A habit is a behavior that you perform regularly, often automatically. It is the brain's way of saving energy. Instead of deliberating over every action, your brain turns repeated behaviors into shortcuts.",
          "Habits shape more of your life than you realize. Research suggests that about 40% of your daily actions are habits, not conscious decisions. Your morning routine, your eating patterns, your response to stress.",
          "The good news is that habits can be changed. Understanding how habits work gives you the power to design better ones. And better habits lead to a better life.",
          "At Intent&eacute.o, we track habits not just as checkboxes but as indicators of who you are becoming.",
        ],
      },
      {
        title: "Why Habits Matter",
        content: [
          "Your habits are your identity in action. Every time you complete a habit, you are casting a vote for the type of person you want to become. Read every day? You are a learner. Exercise regularly? You are someone who takes care of their body.",
          "Small habits compound over time. Reading 10 pages a day is 12 books a year. Walking 20 minutes a day is 120 hours of movement. These small actions produce extraordinary results.",
          "Habits also create consistency. When something is a habit, you do not have to rely on motivation or willpower. It just happens. That is the power of habit.",
          "The most successful people are not necessarily the most talented. They are the most consistent. And consistency comes from habits.",
        ],
      },
      {
        title: "Habits and Identity",
        content: [
          "Most habit advice focuses on repetition. Do it every day, build momentum, do not break the chain. But repetition alone does not create lasting change. Identity does.",
          "The most durable habits are not things you force yourself to do. They are expressions of who you believe you are. A person who says I am trying to read more behaves differently from someone who says I am a reader.",
          "The identity comes first. The habit follows. Instead of focusing on outcomes (read 50 books), focus on who you want to become (someone who learns daily).",
          "Each small action is a vote for that identity. And over time, those votes add up to a new sense of self.",
        ],
      },
      {
        title: "Building Sustainable Habits",
        content: [
          "The secret to building habits that last is to make them easy to start and hard to skip. Reduce friction for good habits. Increase friction for bad ones.",
          "Start so small that it feels almost too easy. Want to meditate? Start with one minute. Want to write? Start with one sentence. Want to exercise? Start with putting on your shoes.",
          "The two-minute rule is powerful: if a habit takes less than two minutes to start, you will actually do it. The hardest part of any habit is starting. Not finishing. Starting.",
          "Once you start, momentum takes over. Most of the time, you will do more than two minutes. But even if you do not, you have kept the habit alive.",
        ],
      },
      {
        title: "Starting Small",
        content: [
          "Here is the rule: if a habit takes less than two minutes to start, you will actually do it. Sounds too simple? That is exactly why it works.",
          "The hardest part of any habit is starting. Not finishing. Starting. When you shrink a habit down to its first two minutes, you remove the friction.",
          "Want to run? Just put on your shoes. Want to meditate? Just sit and breathe for 120 seconds. Want to read? Just open the book to the first page.",
          "The two-minute version is not the habit itself. It is the gateway. Once you start, momentum takes over. And you have cast a vote for the person you want to become.",
        ],
      },
      {
        title: "Consistency vs Perfection",
        content: [
          "Consistency is not about perfection. It is about showing up most of the time. Missing one day does not break a habit. Missing two starts to. Missing three is a pattern.",
          "The key is to make habits easy to start and hard to skip. Design your environment so the right choice is the easy choice. Want to eat healthier? Prep meals on Sunday. Want to read more? Put a book on your pillow.",
          "Track your habits visually. Intent&eacute.o shows your consistency over time, helping you see patterns and adjust. The visual representation of streaks is motivating. But do not let a broken streak discourage you.",
          "Remember: building habits is a lifelong practice. There is no finish line. The goal is progress, not perfection.",
        ],
      },
      {
        title: "Recovering After Missing a Habit",
        content: [
          "Missing a habit is not failure. It is data. Ask yourself: What caused me to miss? Was it too ambitious? Was the timing wrong? Was I relying on willpower instead of design?",
          "The most important thing is to get back on track quickly. Do not let one missed day become two. And do not let two become three. The faster you recover, the stronger the habit becomes.",
          "Self-compassion matters. Beating yourself up for missing a habit does not help. It actually makes it harder to start again. Treat yourself like you would treat a friend.",
          "Intent&eacute.o helps you recover without guilt. The recovery system is designed to get you back on track, not to punish you for falling off.",
        ],
      },
      {
        title: "Connecting Habits to Your Goals",
        content: [
          "Every habit should serve your bigger picture. Ask yourself: How does this habit contribute to my goals? If it does not, it might not be worth pursuing.",
          "The best habits are the ones that move you closer to your vision. They do not feel like obligations. They feel like investments in the person you want to become.",
          "Intent&eacute.o connects your habits to your goals. You can see how each habit contributes to your bigger picture. This connection is what makes habits meaningful.",
          "When you see the connection between your daily actions and your long-term vision, motivation becomes internal. You do not need external pressure to stay on track.",
        ],
      },
    ],
  },
  productivity: {
    slug: "productivity",
    title: "Productivity",
    description: "Focus, prioritization, and intentional planning.",
    color: "bg-cyan-500/10 text-cyan-600",
    iconBg: "bg-cyan-500/10 text-cyan-600",
    topics: [
      {
        title: "What Is Intentional Productivity?",
        content: [
          "There is a difference between being busy and being present. You can cross off twenty tasks and still feel like you were not really there for any of them. Intentional productivity is about closing that gap.",
          "It starts with awareness. Before diving into your day, take a moment to set an intention. What matters most today? Not what is most urgent. What is most important? That single question can redirect your entire day.",
          "Throughout the day, practice single-tasking. Do one thing at a time. When you are writing, just write. When you are listening, just listen. It sounds simple, but it is radical in a world designed for distraction.",
          "The result is not just better work. It is a better experience of being alive. You notice more. You enjoy more. You feel more present in the moments that matter.",
        ],
      },
      {
        title: "Productivity vs Busyness",
        content: [
          "Being busy is not the same as being productive. Busyness is about doing more. Productivity is about doing the right things. Both feel like work. But only one leads to results that matter.",
          "Busyness is often a defense mechanism. It keeps you from facing the harder questions. What actually matters? Am I working on the right things? Or am I just staying busy to avoid discomfort?",
          "True productivity starts with clarity. Before optimizing how you work, ask why you are working. Before adding another tool, ask what you are trying to achieve.",
          "The goal is not to do more. The goal is to do what matters. And that requires intentional choices.",
        ],
      },
      {
        title: "Prioritization",
        content: [
          "Every yes is a no to something else. When you say yes to a meeting, you say no to focused work. When you say yes to a commitment, you say no to free time. Understanding this changes everything.",
          "Prioritization is not about doing everything. It is about doing the right things. The most important work often gets pushed aside by the most urgent. But urgency is not the same as importance.",
          "Use your purpose as a filter. When faced with a decision, ask: Does this align with what matters most to me? If not, let it go.",
          "The quiet power of saying no is that it protects your yes. When your yes means something, it carries weight. People trust it. You trust it.",
        ],
      },
      {
        title: "Planning Your Day",
        content: [
          "Before you check your phone, check in with yourself. Two minutes of morning intention-setting can change the entire trajectory of your day.",
          "Ask yourself one question: What matters most today? Not what is urgent. Not what is loud. What actually matters? Write it down. One sentence. That sentence becomes your compass.",
          "Throughout the day, when distractions arise and they will, you have a reference point. Is this aligned with what matters today? If not, let it go.",
          "Intent&eacute.o helps you set your focus each morning and stay connected to it throughout the day.",
        ],
      },
      {
        title: "Choosing What Matters",
        content: [
          "You have tried the Pomodoro Technique. You have color-coded your calendar. You have downloaded every app. And yet, you still feel behind. Here is why: productivity hacks optimize your system, but they do not question your direction.",
          "The problem is not that you are not organized enough. The problem is that you might be organizing the wrong things. Without clarity on what matters, every hack just helps you do more of what does not matter.",
          "Real productivity starts with purpose. Before optimizing how you work, ask why you are working. The answers might surprise you.",
          "Stop collecting hacks. Start building clarity.",
        ],
      },
      {
        title: "Managing Your Focus",
        content: [
          "Multitasking is a myth. What you are actually doing is rapid task-switching, and each switch costs you focus, time, and energy. Studies show it takes an average of 23 minutes to fully regain focus after an interruption.",
          "Single-tasking is the antidote. Do one thing at a time. When you are writing, just write. When you are in a meeting, just be there. When you are with your family, put the phone away.",
          "It sounds simple, but in a world designed for distraction, it is radical. Notifications, tabs, and multi-window setups are all engineered to pull your attention in multiple directions. Choosing focus is an act of rebellion.",
          "The result is not just better work. It is a better experience of being alive. You notice more. You enjoy more.",
        ],
      },
      {
        title: "Completing Important Work",
        content: [
          "The most important work is often the hardest to start. It requires deep focus, sustained attention, and resistance to distraction. That is why it often gets pushed aside.",
          "Create conditions for deep work. Block time on your calendar. Remove distractions. Set a clear intention for what you want to accomplish.",
          "Start with the hardest thing first. Your willpower is highest in the morning. Use it for the work that matters most, not for clearing your inbox.",
          "Progress on important work is deeply satisfying. It is the difference between feeling busy and feeling fulfilled.",
        ],
      },
      {
        title: "Productivity Without Burnout",
        content: [
          "Productivity without rest is a recipe for burnout. You cannot run at full speed indefinitely. Your body and mind need recovery time.",
          "Schedule rest as intentionally as you schedule work. Downtime is not laziness. It is recovery. It is when your brain consolidates learning, processes emotions, and recharges energy.",
          "Pay attention to warning signs. Irritability, exhaustion, loss of motivation. These are signals that you need to slow down, not push harder.",
          "Sustainable productivity is a marathon, not a sprint. Pace yourself. The goal is to keep going for years, not to burn out in months.",
        ],
      },
    ],
  },
  reflection: {
    slug: "reflection",
    title: "Reflection",
    description: "Journaling, prompts, and daily review practices.",
    color: "bg-orange-500/10 text-orange-600",
    iconBg: "bg-orange-500/10 text-orange-600",
    topics: [
      {
        title: "What Is Reflection?",
        content: [
          "At the end of most days, we collapse into bed and reach for our phones. But what if, instead, you spent five minutes looking back? Not judging. Just observing.",
          "Daily reflection is the simplest habit with the deepest impact. It turns experience into insight. Without it, you can repeat the same mistakes for years and never notice. With it, even ordinary days become teachers.",
          "Reflection does not need to be complicated. Ask yourself three questions: What went well today? What did not? How aligned did I feel? Write a few sentences. That is it.",
          "Over time, patterns emerge. You will notice which activities energize you, which drain you, and where your time goes versus where you want it to go. This is the raw material of intentional change.",
        ],
      },
      {
        title: "Why Reflect on Your Day?",
        content: [
          "Reflection turns experience into insight. Without it, you can go through the same patterns for years and never notice. With it, even ordinary days become teachers.",
          "It helps you see what is working and what is not. What activities energize you? What drains you? Where does your time actually go?",
          "Reflection also builds self-awareness. The more you observe your patterns, the more choice you have. You stop reacting automatically and start responding intentionally.",
          "The Intent Score is built on this principle. It asks: how intentionally did you live today? And it helps you track that answer over weeks and months.",
        ],
      },
      {
        title: "Journaling for Self-Awareness",
        content: [
          "Journaling is a powerful practice. It helps you process emotions, capture ideas, and make sense of your day. But without structure, it can become an outlet for venting rather than a tool for growth.",
          "The difference is in the questions you ask. Free-form writing lets you dump thoughts on paper. Structured reflection asks you to examine them. What patterns do you notice? What would you do differently?",
          "Structured reflection turns experience into insight. It is the difference between talking about your problems and actually understanding them.",
          "Intent&eacute.o combines journaling with guided reflection prompts and the Intent Score. This creates a feedback loop: you write, you reflect, you measure alignment, and you adjust.",
        ],
      },
      {
        title: "Learning From Your Actions",
        content: [
          "Every action you take is information. Some actions move you closer to your goals. Some move you further away. Reflection helps you tell the difference.",
          "At the end of each day, ask: What did I do today that aligned with my values? What did I do that did not? This is not about judgment. It is about awareness.",
          "When you see your patterns clearly, you can make better choices. You can do more of what works and less of what does not. That is how real growth happens.",
          "Intent&eacute.o helps you track this alignment over time. The data tells a story. And that story guides your next steps.",
        ],
      },
      {
        title: "Reviewing Your Progress",
        content: [
          "Weekly reflection is powerful. Set aside 15 minutes each week to look back. What went well? What was challenging? What did you learn?",
          "Monthly reflection adds another layer. What patterns do you see over the course of a month? What goals are progressing? What habits are sticking?",
          "Quarterly reflection helps you zoom out. Are you moving toward your vision? Do your goals still align with your purpose? What needs to change?",
          "Reflection at different time scales gives you different insights. Daily reflection shows you the details. Weekly shows you the patterns. Monthly shows you the direction.",
        ],
      },
      {
        title: "Gratitude and Reflection",
        content: [
          "Gratitude is a powerful addition to any reflection practice. It shifts your focus from what is missing to what is present. From what went wrong to what went right.",
          "Each day, write down three things you are grateful for. They do not have to be big. A good conversation. A moment of quiet. A task completed. Small gratitude compounds into big perspective.",
          "Gratitude also builds resilience. When you practice noticing the good, you become better at finding it even on hard days.",
          "Combine gratitude with reflection for a powerful daily practice. What went well? What am I grateful for? How aligned did I feel?",
        ],
      },
      {
        title: "Turning Reflection Into Better Decisions",
        content: [
          "Reflection without action is just rumination. The point of looking back is to move forward more intentionally. Ask yourself: What will I do differently tomorrow?",
          "Use your reflection to make small adjustments. Maybe you need to say no more often. Maybe you need to spend more time on deep work. Maybe you need to move your body.",
          "These small adjustments, made consistently, lead to big changes over time. That is the power of reflection.",
          "Intent&eacute.o helps you close the loop. You reflect, you adjust, you act. And then you reflect again. That is how intentional living works.",
        ],
      },
      {
        title: "Creating a Daily Reflection Practice",
        content: [
          "Start small. Five minutes at the end of each day. Three questions: What went well? What did not? How aligned did I feel? Write a few sentences.",
          "Make it consistent. Same time, same place, same questions. Consistency turns reflection from a chore into a habit. And habits are where the real change happens.",
          "Use a tool that supports your practice. Intent&eacute.o combines journaling with guided prompts and the Intent Score. It creates a feedback loop that helps you grow.",
          "Remember: reflection is not about being perfect. It is about being honest. Honest about how you spend your time, and honest about the gap between your intentions and your actions.",
        ],
      },
    ],
  },
}

const categoryOrder = ["purpose", "vision", "goals", "habits", "productivity", "reflection"]

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = categories[slug]
  if (!category) return { title: "Topic Not Found" }
  return {
    title: `Understanding ${category.title} | Intent&eacute;o`,
    description: `Learn about ${category.title.toLowerCase()} in the context of intentional living. ${category.description}`,
    openGraph: {
      title: `Understanding ${category.title} | Intent&eacute;o`,
      description: `Learn about ${category.title.toLowerCase()} in the context of intentional living. ${category.description}`,
      siteName: "Inteéntéo",
    },
  }
}

export async function generateStaticParams() {
  return categoryOrder.map((slug) => ({ slug }))
}

export default async function LearnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categories[slug]
  if (!category) notFound()

  const relatedSlugs = categoryOrder.filter((s) => s !== slug).slice(0, 3)
  const relatedCategories = relatedSlugs.map((s) => categories[s])

  return (
    <MarketingLayout>
      <section className="pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px]">
            {/* Back link */}
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Link>

            {/* Header */}
            <header className="mb-10">
              <span className={cn(
                "inline-block rounded-full px-3.5 py-1 text-xs font-semibold mb-5",
                category.color
              )}>
                {category.title}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
                {category.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {category.description}
              </p>
              <div className="mt-8 h-px bg-border" />
            </header>

            {/* Content */}
            <LearnDetailContent topics={category.topics} />

            {/* Related Topics */}
            <div className="mt-14 pt-8 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-5">Explore More</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedCategories.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/learn/${rel.slug}`}
                    className="group rounded-xl border-[1.5px] p-4 text-left transition-all hover:shadow-md"
                    style={{ borderColor: rel.color.includes("purple") ? "rgba(168,85,247,0.2)" : rel.color.includes("blue") ? "rgba(59,130,246,0.2)" : rel.color.includes("emerald") ? "rgba(16,185,129,0.2)" : rel.color.includes("cyan") ? "rgba(6,182,212,0.2)" : rel.color.includes("orange") ? "rgba(249,115,22,0.2)" : "rgba(30,14,107,0.2)" }}
                  >
                    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-2", rel.color)}>
                      {rel.title}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-[#1E0E6B] transition-colors">
                      {rel.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {rel.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-14 rounded-2xl bg-[#1E0E6B] p-8 sm:p-10 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Ready to put what you have learned into practice?
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-white/70">
                Intent&eacute;o helps you connect what matters to what you do every day.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Get Started For Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
