class Entry < ApplicationRecord
  belongs_to :user
  belongs_to :campaign
  has_one :shipment, dependent: :destroy

  validates :status, presence: true
  validates :user_id, uniqueness: { scope: :campaign_id, message: "has already applied to this campaign" }

  enum status: {
    pending: 'pending',
    winner: 'winner',
    loser: 'loser',
    shipped: 'shipped',
    completed: 'completed'
  }

  scope :winners, -> { where(status: 'winner') }
  scope :recent, -> { order(created_at: :desc) }

  def can_review?
    %w[shipped completed].include?(status)
  end

  def has_review?
    user.reviews.exists?(campaign: campaign)
  end
end