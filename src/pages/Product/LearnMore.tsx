// src/pages/Help/LearningPage.tsx

import React, { useState } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  RefreshCw, 
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Play,
  BookOpen,
  Lightbulb,
  Shield,
  Users,
  Eye,
  Settings,
  Printer,
  Download,
  Mail,
  Calendar,
  Layers,
  Link,
  CheckSquare,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Home,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Send,
  FileCheck,
  Package,
  Building,
  User,
  Globe,
  MapPin,
  CreditCard,
  Wallet,
  TrendingUp,
  BarChart,
  Compass,
  HelpCircle
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';

// ==================== TYPES ====================
interface Step {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  tips?: string[];
}

interface DocumentType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  steps: Step[];
  keyPoints: string[];
  videoUrl?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// ==================== COMPONENTS ====================

const StepCard: React.FC<{ step: Step; index: number; total: number }> = ({ step, index, total }) => {
  return (
    <div className="relative">
      {/* Vertical line connecting steps */}
      {index < total - 1 && (
        <div className="absolute left-5 top-10 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}
      
      <div className="flex items-start gap-4">
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <span className="text-sm font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 pb-8">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            {step.title}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {step.description}
          </p>
          {step.tips && step.tips.length > 0 && (
            <div className="mt-2 space-y-1">
              {step.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentCard: React.FC<{
  doc: DocumentType;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ doc, isExpanded, onToggle }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className={`rounded-xl p-3 bg-gradient-to-br ${doc.color} text-white shadow-lg`}>
          {doc.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {doc.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {doc.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {doc.steps.length} steps
          </span>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          {/* Key Points */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Key Points
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {doc.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Step-by-Step Guide
            </h4>
            <div className="space-y-2">
              {doc.steps.map((step, index) => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  index={index} 
                  total={doc.steps.length} 
                />
              ))}
            </div>
          </div>

          {/* Video placeholder */}
          {doc.videoUrl && (
            <div className="mt-6 rounded-lg bg-gray-100 dark:bg-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500 p-2 text-white">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Video Tutorial Available
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Watch this step-by-step video guide
                  </p>
                </div>
                <button className="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Watch Now →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FAQSection: React.FC<{ faqs: FAQ[] }> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {faq.question}
            </span>
            {openIndex === index ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== MAIN PAGE ====================
export default function LearningPage() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  // Document Types Data
  const documents: DocumentType[] = [
    {
      id: 'requisition',
      title: 'Requisitions',
      description: 'Request for goods or services needed by your department or project. This is the starting point of any procurement process.',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      keyPoints: [
        'Create a requisition for items you need',
        'Add multiple items with quantities and estimated prices',
        'Submit for approval when complete',
        'Can be for exams, events, office supplies, or any need',
        'Approved requisitions can be converted to Purchase Orders'
      ],
      steps: [
        {
          id: 1,
          title: 'Create Requisition',
          description: 'Fill in the requisition details including title, description, and category. This describes what you need and why.',
          tips: [
            'Use clear titles like "Exam Materials - 2024 Session 1"',
            'Provide detailed descriptions to help approvers understand the need',
            'Select the correct budget and department'
          ]
        },
        {
          id: 2,
          title: 'Add Items',
          description: 'Click the "Add Item" button to add products or services to your requisition. Each item includes name, quantity, and estimated price.',
          tips: [
            'Add items one by one to ensure accuracy',
            'Check that quantities and prices are correct',
            'Total amount updates automatically',
            'You can edit or remove items before submission'
          ]
        },
        {
          id: 3,
          title: 'Submit for Approval',
          description: 'Once all items are added and reviewed, click "Submit for Approval". This sends your requisition to the approval workflow.',
          tips: [
            'Review all items and totals before submitting',
            'Submission is final and cannot be edited',
            'You will receive notifications on approval status'
          ]
        }
      ]
    },
    {
      id: 'purchase_order',
      title: 'Purchase Orders',
      description: 'Official order document created from approved requisitions. This authorizes the purchase and can be given to a vendor or staff member to procure items.',
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      keyPoints: [
        'Created from approved requisitions',
        'Multiple requisition items can be combined',
        'Can be issued to external vendors or staff',
        'Staff can use this to purchase items from the market',
        'Authorizes the procurement of goods/services'
      ],
      steps: [
        {
          id: 1,
          title: 'Select Approved Requisitions',
          description: 'Choose approved requisitions to convert into a purchase order. You can combine multiple requisitions into one PO for efficiency.',
          tips: [
            'Group requisitions from the same department',
            'Consider consolidating for the same purpose',
            'Check total amounts before proceeding'
          ]
        },
        {
          id: 2,
          title: 'Create Purchase Order',
          description: 'The system combines items from selected requisitions into a single purchase order. Specify who will procure the items - can be a vendor or a staff member.',
          tips: [
            'Select the appropriate procurement method',
            'If a staff member is procuring, add them as the "vendor"',
            'Set expected delivery dates',
            'Add any special instructions'
          ]
        },
        {
          id: 3,
          title: 'Submit for Approval',
          description: 'Review the purchase order and submit for approval. Approvers will check the order details, procurement method, and total amount.',
          tips: [
            'Ensure all items are correct before submitting',
            'Check if the total amount is within budget',
            'Track the PO number for reference',
            'Approved POs can be issued to vendors or staff'
          ]
        }
      ]
    },
    {
      id: 'cash_advance',
      title: 'Cash Advance',
      description: 'Request for cash advances for business expenses, events, or market purchases where card/transfer is not possible.',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      keyPoints: [
        'Request cash for specific business purposes',
        'Items attached to justify the advance',
        'Must be submitted for approval',
        'Used for business trips, events, market purchases, etc.',
        'Requires reconciliation after use'
      ],
      steps: [
        {
          id: 1,
          title: 'Create Cash Advance',
          description: 'Describe the purpose of the cash advance and the amount needed. Justify why cash is required instead of other payment methods.',
          tips: [
            'Be specific about the purpose',
            'Provide estimated costs for each item',
            'Mention the event, trip, or market visit details'
          ]
        },
        {
          id: 2,
          title: 'Attach Items',
          description: 'Add items that explain what the cash advance will be used for. This helps approvers understand the breakdown and need for cash.',
          tips: [
            'List all expected expenses',
            'Include quantities and estimated prices',
            'Attach supporting documents if needed',
            'Market purchases should include item details'
          ]
        },
        {
          id: 3,
          title: 'Submit for Approval',
          description: 'Submit the cash advance request. Approvers will review the justification and amount before approval.',
          tips: [
            'Ensure the total amount is justified',
            'Double-check all item details',
            'Keep track of the advance for reconciliation',
            'Receipts must be submitted after use'
          ]
        }
      ]
    },
    {
      id: 'cash_transfer',
      title: 'Cash Transfers',
      description: 'Move funds between accounts for cash flow management. Accounts can be banks, imprest, or other financial accounts.',
      icon: <RefreshCw className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600',
      keyPoints: [
        'Transfer funds between accounts',
        'Helps maintain cash flow',
        'Approval required for transfers',
        'Tracks movement of money',
        'Accounts can be banks, imprest, etc.'
      ],
      steps: [
        {
          id: 1,
          title: 'Select Source and Destination',
          description: 'Choose the account you are transferring from and the account you are transferring to. This could be bank to bank, bank to imprest, etc.',
          tips: [
            'Verify account details are correct',
            'Check available balance before transferring',
            'Consider the reason for the transfer'
          ]
        },
        {
          id: 2,
          title: 'Enter Amount and Reason',
          description: 'Specify the amount to transfer and provide a clear reason for the transfer. This helps in tracking and auditing.',
          tips: [
            'Be specific about the transfer purpose',
            'Include reference numbers if applicable',
            'Attach supporting documents'
          ]
        },
        {
          id: 3,
          title: 'Submit for Approval',
          description: 'Submit the cash transfer for approval. Approvers will review the transfer details and ensure it aligns with financial policies.',
          tips: [
            'Ensure the amount is accurate',
            'Check that the source account has sufficient funds',
            'Keep the transfer reference for tracking'
          ]
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget Management',
      description: 'Plan and allocate funds for categories and items over a specific period. Only approved budgets can be used to track expenses.',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'from-red-500 to-red-600',
      keyPoints: [
        'Create budgets for departments/projects',
        'Define categories and item allocations',
        'Must be submitted for approval',
        'Only approved budgets can be used',
        'Tracks actual vs. planned spending'
      ],
      steps: [
        {
          id: 1,
          title: 'Create Budget',
          description: 'Define the budget period and overall amount. This is the total available for spending across all categories.',
          tips: [
            'Set realistic budget periods',
            'Consider historical spending patterns',
            'Align with organizational goals'
          ]
        },
        {
          id: 2,
          title: 'Add Categories and Items',
          description: 'Break down the budget into categories and specific items. Each category gets an allocation, and items within categories get specific amounts.',
          tips: [
            'Allocate based on priority',
            'Leave some contingency for emergencies',
            'Consider inflation and price changes'
          ]
        },
        {
          id: 3,
          title: 'Submit for Approval',
          description: 'Submit the budget for review. Approvers will evaluate the allocations and ensure it aligns with strategic objectives.',
          tips: [
            'Provide clear reasoning for allocations',
            'Justify any unusual expenses',
            'Be prepared to adjust based on feedback'
          ]
        }
      ]
    }
  ];

  // FAQ Data
  const faqs: FAQ[] = [
    {
      question: 'What is the difference between a Requisition and a Purchase Order?',
      answer: 'A Requisition is an internal request for goods or services made by a department. A Purchase Order is the official authorization to procure the items. It can be given to an external vendor OR a staff member who will go to the market to purchase the items. Purchase Orders are created from approved requisitions.'
    },
    {
      question: 'Can a staff member be the "vendor" for a Purchase Order?',
      answer: 'Yes! When a staff member is tasked with going to the market or a specific store to purchase items, they can be designated as the vendor on the Purchase Order. This is common for items that need to be procured locally or where a formal vendor relationship does not exist.'
    },
    {
      question: 'How do I know when my document has been approved?',
      answer: 'You will receive notifications through the system when your document is approved, rejected, or when action is required. You can also track the status of your documents in the "My Documents" section.'
    },
    {
      question: 'Can I edit a document after submitting for approval?',
      answer: 'No, once a document is submitted for approval, it becomes locked for editing. This ensures the integrity of the approval process. If changes are needed, you can withdraw the document (if allowed) or wait for it to be rejected and then make changes.'
    },
    {
      question: 'What happens if my requisition is rejected?',
      answer: 'If a requisition is rejected, you will receive feedback from the approver on why it was rejected. You can then make the necessary changes and resubmit it for approval. The rejection reason is recorded in the audit trail.'
    },
    {
      question: 'How do I combine multiple requisitions into one Purchase Order?',
      answer: 'Once requisitions are approved, you can go to the Purchase Order section, select "Create from Requisitions", and choose the approved requisitions you want to combine. The system will merge all items into a single purchase order. This is useful when multiple departments need items from the same vendor or when a staff member is making a single shopping trip.'
    },
    {
      question: 'When should I use a Cash Advance instead of a Purchase Order?',
      answer: 'Use Cash Advance when you need to pay with cash at the point of purchase (like at a market, local store, or for petty expenses). Use Purchase Order when you want to authorize the purchase but don\'t need to disburse cash upfront - this is more common for formal vendors or when staff members will pay and be reimbursed.'
    },
    {
      question: 'How does the approval workflow work?',
      answer: 'Different document types and amounts follow different approval paths. Based on the document type and total amount, the system automatically routes it to the appropriate approvers. You can see the approval status and current approver in the document details.'
    }
  ];

  return (
    <>
      <PageMeta
        title="Learning Center | Procurement System"
        description="Learn how to use the procurement system effectively"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Learning Center
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Learn how to navigate the procurement system, create documents, and understand the workflow
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="mb-8 rounded-xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Quick Navigation
            </h2>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    expandedDoc === doc.id
                      ? `bg-gradient-to-r ${doc.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {doc.icon}
                  {doc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards */}
          <div className="space-y-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isExpanded={expandedDoc === doc.id}
                onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
              />
            ))}
          </div>

          {/* Workflow Overview */}
          <div className="mt-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Understanding the Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">1. Create Document</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create any document type (Requisition, Purchase Order, Cash Advance, etc.) with all required details and items
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <Send className="h-5 w-5" />
                  <span className="font-medium">2. Submit for Approval</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Submit to the approval workflow. The system routes it based on document type, amount, and your organization's approval matrix
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">3. Approval & Execution</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  After approval, execute the document - order items (PO), disburse cash (Cash Advance), transfer funds (Cash Transfer), or track spending (Budget)
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 rounded-xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Frequently Asked Questions
            </h2>
            <FAQSection faqs={faqs} />
          </div>

          {/* Support Section */}
          <div className="mt-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-6 border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Need more help?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact our support team for assistance with any issues
                </p>
              </div>
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600">
                  <Printer className="h-4 w-4" />
                  Print Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}