import { useState, useEffect, useRef, useCallback } from 'react';
import { gitHubApi } from '../../services/api';
import './GitHubAutocomplete.css';

/**
 * Extracts a candidate username from user input (handles full URLs, @handle, or plain text).
 */
function cleanQuery(input) {
  if (!input) return '';
  let str = input.trim().replace(/^['"`]+|['"`]+$/g, '');

  // Extract from GitHub URL if pasted
  if (str.toLowerCase().includes('github.com')) {
    try {
      const url = str.startsWith('http') ? str : `https://${str}`;
      const pathname = new URL(url).pathname.replace(/^\/|\/$/g, '');
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        if ((parts[0] === 'users' || parts[0] === 'orgs') && parts[1]) {
          str = parts[1];
        } else {
          str = parts[0];
        }
      }
    } catch {
      const match = str.match(/github\.com\/([^/?#]+)/i);
      if (match) str = match[1];
    }
  }

  // Remove leading @ and trailing .git
  str = str.replace(/^@+/, '').replace(/\.git$/i, '');
  return str.split('/')[0].trim();
}

export default function GitHubAutocomplete({
  value,
  onChange,
  onSelectUser,
  onSubmit,
  disabled = false,
  placeholder = 'e.g. torvalds or https://github.com/torvalds',
  id = 'github-username',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const cacheRef = useRef({});
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isSelectingRef = useRef(false);

  // Active query being searched
  const extractedQuery = cleanQuery(value);

  // Perform search with debounce
  const fetchSuggestions = useCallback(
    async (query) => {
      if (!query || query.length < 1) {
        setSuggestions([]);
        setLoading(false);
        setError(null);
        setIsOpen(false);
        return;
      }

      const cacheKey = query.toLowerCase();
      if (cacheRef.current[cacheKey]) {
        setSuggestions(cacheRef.current[cacheKey]);
        setLoading(false);
        setError(null);
        setIsOpen(true);
        setActiveIndex(-1);
        return;
      }

      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setIsOpen(true);

      try {
        const users = await gitHubApi.searchUsers(query, abortControllerRef.current.signal);
        cacheRef.current[cacheKey] = users;
        setSuggestions(users);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Unable to fetch GitHub suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Handle typing change
  const handleInputChange = (e) => {
    const newVal = e.target.value;
    onChange(newVal);

    const query = cleanQuery(newVal);
    if (!query) {
      setSuggestions([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 280);
  };

  // Keyboard navigation & Enter selection
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setActiveIndex((prev) => {
        const next = prev < suggestions.length - 1 ? prev + 1 : 0;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : suggestions.length - 1;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        e.stopPropagation();
        handleSelect(suggestions[activeIndex]);
      } else {
        // If no suggestion item is highlighted, allow form submission and close dropdown
        setIsOpen(false);
        if (onSubmit) {
          onSubmit(e);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const scrollActiveIntoView = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.gh-autocomplete__item');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelect = (user, triggerAnalyze = false) => {
    isSelectingRef.current = true;
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setError(null);
    onChange(user.username);

    if (onSelectUser) {
      onSelectUser(user, triggerAnalyze);
    }

    setTimeout(() => {
      isSelectingRef.current = false;
    }, 300);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    setError(null);
    setActiveIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, []);

  // Cleanup timers & requests on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="gh-autocomplete" ref={containerRef}>
      <div className="gh-autocomplete__input-wrapper">
        <span className="gh-autocomplete__icon-left" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          className="gh-autocomplete__input"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (isSelectingRef.current) return;
            if (extractedQuery && (suggestions.length > 0 || loading || error)) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="github-suggestions-dropdown"
          aria-label="GitHub username or profile link"
          required
        />

        <div className="gh-autocomplete__actions-right">
          {loading && <div className="gh-autocomplete__spinner" title="Searching GitHub users..." aria-label="Loading" />}
          {value && !loading && (
            <button
              type="button"
              className="gh-autocomplete__clear-btn"
              onClick={handleClear}
              title="Clear input"
              aria-label="Clear username input"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div id="github-suggestions-dropdown" className="gh-autocomplete__dropdown" role="listbox">
          {loading && suggestions.length === 0 && (
            <div className="gh-autocomplete__state-box">
              <div className="gh-autocomplete__spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              <p className="gh-autocomplete__state-title">Searching GitHub...</p>
              <p className="gh-autocomplete__state-desc">Finding real profiles matching &ldquo;{extractedQuery}&rdquo;</p>
            </div>
          )}

          {error && (
            <div className="gh-autocomplete__state-box">
              <span className="gh-autocomplete__state-icon" aria-label="Warning">[!]</span>
              <p className="gh-autocomplete__state-title">Search Notice</p>
              <p className="gh-autocomplete__state-desc">{error}</p>
              {error.toLowerCase().includes('rate limit') && (
                <span className="gh-autocomplete__rate-limit-badge">Rate Limit Active</span>
              )}
            </div>
          )}

          {!loading && !error && suggestions.length === 0 && extractedQuery && (
            <div className="gh-autocomplete__state-box">
              <span className="gh-autocomplete__state-icon" aria-label="Not Found">[?]</span>
              <p className="gh-autocomplete__state-title">No GitHub users found</p>
              <p className="gh-autocomplete__state-desc">
                No accounts match &ldquo;<strong>{extractedQuery}</strong>&rdquo;. You can still type the full username or URL and click Analyze.
              </p>
            </div>
          )}

          {suggestions.length > 0 && (
            <ul ref={listRef} className="gh-autocomplete__list">
              {suggestions.map((user, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <li
                    key={user.username || idx}
                    id={`gh-suggestion-${idx}`}
                    className={`gh-autocomplete__item ${isSelected ? 'gh-autocomplete__item--active' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(user, false)}
                  >
                    <div className="gh-autocomplete__avatar-wrapper">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={`${user.username}'s avatar`}
                          className="gh-autocomplete__avatar"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sibling = e.currentTarget.nextElementSibling;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="gh-autocomplete__avatar-fallback"
                        style={{ display: user.avatar_url ? 'none' : 'flex' }}
                      >
                        {(user.username || 'G').charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="gh-autocomplete__details">
                      <div className="gh-autocomplete__username-row">
                        <span className="gh-autocomplete__username">
                          @{user.username}
                        </span>
                      </div>

                      {user.name && user.name.trim().toLowerCase() !== user.username.trim().toLowerCase() && (
                        <span className="gh-autocomplete__name">{user.name.trim()}</span>
                      )}

                      {user.bio && user.bio.trim() && (
                        <span className="gh-autocomplete__bio" title={user.bio.trim()}>
                          {user.bio.trim()}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
