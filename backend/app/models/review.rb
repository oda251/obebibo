class Review < ApplicationRecord
  belongs_to :user
  belongs_to :campaign

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, presence: true, length: { minimum: 10, maximum: 1000 }
  validates :user_id, uniqueness: { scope: :campaign_id, message: "has already reviewed this campaign" }

  scope :recent, -> { order(created_at: :desc) }
  scope :by_rating, ->(rating) { where(rating: rating) }

  def rating_text
    case rating
    when 5 then '非常に良い'
    when 4 then '良い'
    when 3 then '普通'
    when 2 then '悪い'
    when 1 then '非常に悪い'
    end
  end
end