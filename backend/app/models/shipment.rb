class Shipment < ApplicationRecord
  belongs_to :entry
  belongs_to :address

  validates :status, presence: true

  enum status: {
    preparing: 'preparing',
    shipped: 'shipped',
    delivered: 'delivered',
    failed: 'failed'
  }

  scope :recent, -> { order(created_at: :desc) }

  def user
    entry.user
  end

  def campaign
    entry.campaign
  end

  def tracking_info
    return nil unless shipped_at.present?
    "発送日: #{shipped_at.strftime('%Y年%m月%d日')}"
  end
end