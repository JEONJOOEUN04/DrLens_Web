import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  Bell,
  Shield,
  Database,
  Save,
  Loader2,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { useToast } from '../../components/Toast'
import { updateNickname, getMyPage, getSkinProfile, deleteAccount } from '../../api/users'
import { tokens } from '../../api/tokens'

const sections = [
  { id: 'account', icon: User, label: '계정 정보' },
  { id: 'skin', icon: Sparkles, label: '피부 프로필' },
  { id: 'notifications', icon: Bell, label: '알림' },
  { id: 'security', icon: Shield, label: '보안' },
  { id: 'system', icon: Database, label: '시스템' },
]

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full transition ${on ? 'bg-primary' : 'bg-line'} relative`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function SettingsView({ user }) {
  const toast = useToast()
  const qc = useQueryClient()
  const userId = user?.user_id
  const [active, setActive] = useState('account')

  // mypage + skin profile 조회
  const { data: mypage } = useQuery({
    queryKey: ['mypage', userId],
    queryFn: () => getMyPage(userId),
    enabled: !!userId,
  })

  const { data: skinData } = useQuery({
    queryKey: ['skin-profile', userId],
    queryFn: () => getSkinProfile(userId),
    enabled: !!userId,
    retry: false,
  })

  // ===== 계정 정보 =====
  const [nickname, setNickname] = useState('')
  useEffect(() => {
    if (mypage?.user?.nickname) setNickname(mypage.user.nickname)
  }, [mypage])

  const nicknameMutation = useMutation({
    mutationFn: (newNick) => updateNickname(userId, newNick),
    onSuccess: () => {
      toast('닉네임이 변경되었습니다.')
      qc.invalidateQueries({ queryKey: ['mypage', userId] })
      // localStorage의 user 정보도 업데이트
      const u = tokens.getUser()
      if (u) {
        u.nickname = nickname
        const remember = tokens.isRemembered()
        tokens.setAll({ access: tokens.getAccess(), refresh: tokens.getRefresh(), user: u }, remember)
      }
    },
    onError: (err) => toast(err?.message ?? '닉네임 변경 실패', { tone: 'error' }),
  })

  // ===== 알림 =====
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [errorAlert, setErrorAlert] = useState(true)

  // ===== 보안 =====
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')

  const handleChangePw = () => {
    toast('비밀번호 변경 API가 백엔드에 추가되지 않았습니다.', { tone: 'error' })
  }

  // ===== 계정 삭제 =====
  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(userId),
    onSuccess: () => {
      tokens.clear()
      toast('회원 탈퇴가 완료되었습니다.', { tone: 'info' })
      window.dispatchEvent(new Event('dermalens:logout'))
    },
    onError: (err) => toast(err?.message ?? '탈퇴 실패', { tone: 'error' }),
  })

  const handleDelete = () => {
    if (window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      deleteMutation.mutate()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
      <aside className="bg-card border border-line rounded-2xl p-3 h-fit">
        {sections.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition ${
              active === id
                ? 'bg-primary-light text-primary'
                : 'text-text-sub hover:bg-primary-light/40 hover:text-primary-dark'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </aside>

      <section className="bg-card border border-line rounded-2xl p-6">
        {active === 'account' && (
          <div className="space-y-5 max-w-xl">
            <h3 className="text-[16px] font-extrabold text-primary-dark">계정 정보</h3>
            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">이메일</label>
              <input
                type="email"
                value={mypage?.user?.email ?? user?.email ?? ''}
                disabled
                className="w-full h-11 px-3.5 rounded-xl bg-line/30 border border-line text-[14px] text-text-sub"
              />
              <p className="text-[11px] text-text-sub mt-1">이메일은 변경할 수 없습니다.</p>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-bg border border-line text-[14px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">가입일</label>
              <input
                type="text"
                value={mypage?.user?.created_at ?? '-'}
                disabled
                className="w-full h-11 px-3.5 rounded-xl bg-line/30 border border-line text-[14px] text-text-sub"
              />
            </div>
            <button
              onClick={() => nicknameMutation.mutate(nickname)}
              disabled={nicknameMutation.isPending || !nickname.trim()}
              className="h-11 px-5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-1.5 hover:brightness-110 disabled:opacity-60 transition"
            >
              {nicknameMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {nicknameMutation.isPending ? '저장 중...' : '닉네임 저장'}
            </button>

            <div className="pt-6 mt-6 border-t border-line">
              <h4 className="text-[14px] font-bold text-danger mb-2">위험 구역</h4>
              <p className="text-[12px] text-text-sub mb-3">
                계정을 삭제하면 모든 분석 기록·리뷰·좋아요가 영구 삭제됩니다.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="h-10 px-4 rounded-xl bg-danger/10 text-danger text-[13px] font-bold flex items-center gap-1.5 hover:bg-danger/15 transition disabled:opacity-60"
              >
                <Trash2 size={14} /> 회원 탈퇴
              </button>
            </div>
          </div>
        )}

        {active === 'skin' && (
          <div className="space-y-5 max-w-xl">
            <h3 className="text-[16px] font-extrabold text-primary-dark">피부 프로필</h3>
            {skinData?.profile ? (
              <dl className="divide-y divide-line">
                <Row label="피부 타입" value={skinData.profile.skin_type?.name_kr ?? '미설정'} />
                <Row label="피부 타입 코드" value={skinData.profile.skin_type?.code ?? '-'} />
                <Row label="민감도" value={`${skinData.profile.sensitivity_level ?? '-'} / 5`} />
                <Row
                  label="여드름 우려"
                  value={skinData.profile.acne_prone_flag ? '있음' : '없음'}
                />
                <Row
                  label="선호 텍스처"
                  value={skinData.profile.preferred_texture?.name_kr ?? '-'}
                />
                <Row
                  label="관심 고민"
                  value={(skinData.profile.skin_concerns ?? []).join(', ') || '-'}
                />
                <Row
                  label="알레르기"
                  value={(skinData.profile.allergies ?? []).join(', ') || '-'}
                />
                <Row label="최종 업데이트" value={skinData.profile.updated_at ?? '-'} />
              </dl>
            ) : (
              <p className="text-[13px] text-text-sub">
                피부 프로필이 아직 등록되지 않았습니다. 모바일 앱에서 설문을 완료하면 자동 생성됩니다.
              </p>
            )}
            <p className="text-[11px] text-text-sub pt-3 border-t border-line">
              ⓘ 피부 프로필 수정은 앱의 설문 화면에서 진행해주세요.
            </p>
          </div>
        )}

        {active === 'notifications' && (
          <div className="space-y-5 max-w-xl">
            <h3 className="text-[16px] font-extrabold text-primary-dark">알림 설정</h3>
            <p className="text-[12px] text-text-sub">
              ⓘ 이 설정은 현재 로컬에만 저장됩니다. (서버 동기화 API 없음)
            </p>
            {[
              { label: '이메일 알림', desc: '중요 이벤트를 이메일로 받습니다', val: emailNotif, set: setEmailNotif },
              { label: '푸시 알림', desc: '브라우저 푸시 알림', val: pushNotif, set: setPushNotif },
              { label: '에러 즉시 알림', desc: 'ERROR 레벨 로그 발생 시 즉시 알림', val: errorAlert, set: setErrorAlert },
            ].map((opt) => (
              <div key={opt.label} className="flex items-center justify-between py-3 border-b border-line last:border-0">
                <div>
                  <p className="text-[13px] font-bold text-text-main">{opt.label}</p>
                  <p className="text-[11px] text-text-sub mt-0.5">{opt.desc}</p>
                </div>
                <Toggle
                  on={opt.val}
                  onChange={(v) => {
                    opt.set(v)
                    toast(`${opt.label} ${v ? '활성화' : '비활성화'}`, { tone: 'info', duration: 1500 })
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {active === 'security' && (
          <div className="space-y-5 max-w-xl">
            <h3 className="text-[16px] font-extrabold text-primary-dark">보안</h3>
            <p className="text-[12px] text-warning bg-warning/10 border border-warning/30 rounded-lg p-3">
              ⓘ 비밀번호 변경 API가 아직 백엔드에 없습니다. 추가되면 작동합니다.
            </p>
            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">현재 비밀번호</label>
              <input
                type="password"
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-bg border border-line text-[14px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">새 비밀번호 (8자 이상)</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-bg border border-line text-[14px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <button
              onClick={handleChangePw}
              className="h-11 px-5 rounded-xl bg-primary text-white text-[13px] font-bold hover:brightness-110 transition"
            >
              비밀번호 변경
            </button>
          </div>
        )}

        {active === 'system' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-[16px] font-extrabold text-primary-dark">시스템</h3>
            <dl className="divide-y divide-line">
              <Row label="버전" value="v0.1.0" />
              <Row label="API Base URL" value={import.meta.env.VITE_API_URL || '(proxy)'} />
              <Row label="API 환경" value={import.meta.env.PROD ? 'Production' : 'Development'} />
              <Row label="브라우저" value={navigator.userAgent.split(' ').slice(-2).join(' ')} />
              <Row label="화면 크기" value={`${window.innerWidth} × ${window.innerHeight}`} />
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-[13px]">
      <dt className="text-text-sub">{label}</dt>
      <dd className="font-bold text-text-main text-right truncate">{value}</dd>
    </div>
  )
}

export default SettingsView
