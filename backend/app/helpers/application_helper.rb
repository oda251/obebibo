module ApplicationHelper
  def entry_status_text(status)
    case status
    when 'pending'
      '応募中'
    when 'winner'
      '当選'
    when 'loser'
      '落選'
    when 'shipped'
      '発送済み'
    when 'completed'
      '完了'
    else
      status
    end
  end

  def entry_status_class(status)
    case status
    when 'pending'
      'text-blue-600'
    when 'winner'
      'text-green-600'
    when 'loser'
      'text-red-600'
    when 'shipped'
      'text-purple-600'
    when 'completed'
      'text-gray-600'
    else
      'text-gray-600'
    end
  end

  def shipment_status_text(status)
    case status
    when 'preparing'
      '準備中'
    when 'shipped'
      '発送済み'
    when 'delivered'
      '配達完了'
    when 'failed'
      '配送失敗'
    else
      status
    end
  end

  def campaign_status_text(status)
    case status
    when 'draft'
      '下書き'
    when 'active'
      '募集中'
    when 'closed'
      '募集終了'
    when 'completed'
      '完了'
    else
      status
    end
  end

  def format_rating_stars(rating)
    "★" * rating + "☆" * (5 - rating)
  end
end