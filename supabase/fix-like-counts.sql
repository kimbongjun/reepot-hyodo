-- 좋아요 어뷰징 정규화 스크립트
-- Supabase SQL Editor 에서 단계별로 실행하세요.
--
-- 배경: 이전 시스템은 IP 제한 없이 좋아요를 허용했습니다.
--       현재 개별 좋아요별 IP 기록은 없지만,
--       시스템에 등록된 고유 IP 수보다 많은 좋아요는
--       한 IP가 반복 클릭한 것으로 간주할 수 있습니다.

-- ① 현재 좋아요 현황 확인 (내림차순)
SELECT
  pc.id,
  pc.nickname,
  pc.like_count,
  cs.ip_address AS submitter_ip
FROM public.public_comments pc
JOIN public.comment_submissions cs ON cs.id = pc.id
ORDER BY pc.like_count DESC;

-- ② 시스템 내 고유 IP 수 (정상적 최대 좋아요 상한선)
SELECT COUNT(DISTINCT ip_address) AS unique_ip_count
FROM public.comment_submissions
WHERE ip_address IS NOT NULL;

-- ③ 고유 IP 수를 초과한 like_count를 상한에 맞게 정규화
--    (단일 IP 반복 클릭으로 부풀려진 수치 제거)
WITH max_cap AS (
  SELECT COUNT(DISTINCT ip_address) AS cap
  FROM public.comment_submissions
  WHERE ip_address IS NOT NULL
)
UPDATE public.comment_submissions
SET like_count = LEAST(like_count, (SELECT cap FROM max_cap))
WHERE like_count > (SELECT cap FROM max_cap)
RETURNING id, nickname, like_count AS normalized_count;

-- ④ public_comments 동기화 (Realtime 반영)
UPDATE public.public_comments pc
SET like_count = cs.like_count
FROM public.comment_submissions cs
WHERE pc.id = cs.id
  AND pc.like_count <> cs.like_count;

-- ⑤ 정리 후 확인
SELECT nickname, like_count
FROM public.public_comments
ORDER BY like_count DESC;
