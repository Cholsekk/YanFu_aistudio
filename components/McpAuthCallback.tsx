import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiService } from '../services/apiService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const McpAuthCallback: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const providerId = searchParams.get('provider_id') || state || localStorage.getItem('mcp_auth_provider_id');

    if (!code || !providerId) {
      setStatus('error');
      setError('缺少必要的认证参数 (code 或 provider_id)');
      return;
    }

    const completeAuth = async () => {
      try {
        await apiService.authMcpProvider(providerId, code);
        localStorage.removeItem('mcp_auth_provider_id');
        setStatus('success');
        // Redirect back to MCP services after a short delay
        setTimeout(() => {
          router.push('/?tab=mcp');
        }, 2000);
      } catch (err: any) {
        console.error('MCP Auth Callback Error:', err);
        setStatus('error');
        setError(err.message || '认证失败，请稍后重试');
      }
    };

    completeAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">正在完成认证...</h2>
            <p className="text-gray-500 text-sm">请稍候，正在与服务器同步认证信息。</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">认证成功！</h2>
            <p className="text-gray-500 text-sm">您的 MCP 服务已成功授权。正在为您跳转回管理页面...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">认证失败</h2>
            <p className="text-red-500 text-sm">{error}</p>
            <button 
              onClick={() => router.push('/?tab=mcp')}
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              返回管理页面
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default McpAuthCallback;
