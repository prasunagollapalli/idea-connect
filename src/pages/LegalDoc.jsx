import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';

const LegalDoc = () => {
  const { id } = useParams(); // 'privacy' or 'terms'
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoc();
  }, [id]);

  const fetchDoc = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('slug', id)
        .single();

      if (error) throw error;
      setDoc(data);
    } catch (err) {
      setError('Could not load this document. It may not have been created yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', textDecoration: 'none', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={18} /> Back to Home
      </Link>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
          <p className="text-muted">Loading document...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '8px' }}>Document Not Found</h2>
          <p className="text-muted">{error}</p>
        </div>
      ) : (
        <div className="glass-panel animate-fade-in" style={{ padding: '48px' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FileText size={24} color="var(--primary)" />
              <h1 className="text-gradient" style={{ fontSize: '2rem' }}>{doc.title}</h1>
            </div>
            {doc.updated_at && (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Last updated: {new Date(doc.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
            {doc.content || 'No content has been added yet.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalDoc;
