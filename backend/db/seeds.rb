# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create admin user
admin = Admin.find_or_create_by(email: "admin@obebibo.com") do |a|
  a.name = "管理者"
  a.password = "password"
  a.password_confirmation = "password"
end

# Create sample company
company = Company.find_or_create_by(email: "company@example.com") do |c|
  c.name = "サンプル株式会社"
  c.contact_name = "田中太郎"
  c.contact_phone = "03-1234-5678"
  c.postal_code = "100-0001"
  c.prefecture = "東京都"
  c.city = "千代田区"
  c.address1 = "丸の内1-1-1"
  c.address2 = "サンプルビル10F"
  c.url = "https://example.com"
end

# Create sample users
users = []
5.times do |i|
  user = User.find_or_create_by(email: "user#{i+1}@example.com") do |u|
    u.name = "ユーザー#{i+1}"
    u.password = "password"
    u.password_confirmation = "password"
  end
  users << user
  
  # Create address for each user
  user.addresses.find_or_create_by(is_default: true) do |addr|
    addr.postal_code = "100-000#{i+1}"
    addr.prefecture = "東京都"
    addr.city = "新宿区"
    addr.address1 = "西新宿#{i+1}-#{i+1}-#{i+1}"
    addr.phone = "090-1234-567#{i}"
  end
end

# Create sample campaigns
campaigns = []
3.times do |i|
  campaign = Campaign.find_or_create_by(title: "サンプル商品#{i+1}の無料体験モニター") do |c|
    c.company = company
    c.description = "新商品「サンプル商品#{i+1}」の無料体験モニターを募集しています。商品を実際にお試しいただき、感想をレビューしてください。"
    c.image_url = "https://via.placeholder.com/400x300/#{['ff6b6b', '4ecdc4', 'ffe66d'][i]}/white?text=Sample+Product+#{i+1}"
    c.start_at = 1.week.ago
    c.end_at = 1.month.from_now
    c.status = 'active'
  end
  campaigns << campaign
end

# Create sample entries
users.each_with_index do |user, user_index|
  campaigns.each_with_index do |campaign, campaign_index|
    # Not all users apply to all campaigns
    next if (user_index + campaign_index) % 2 == 0
    
    entry = Entry.find_or_create_by(user: user, campaign: campaign) do |e|
      e.status = ['pending', 'winner', 'loser'].sample
    end
    
    # Create shipment for winners
    if entry.status == 'winner' && entry.shipment.nil?
      Shipment.create!(
        entry: entry,
        address: user.default_address,
        status: ['preparing', 'shipped', 'delivered'].sample,
        shipped_at: rand(1..10).days.ago
      )
    end
  end
end

# Create sample reviews
Entry.where(status: ['winner', 'shipped', 'completed']).sample(5).each do |entry|
  Review.find_or_create_by(user: entry.user, campaign: entry.campaign) do |r|
    r.rating = rand(3..5)
    r.comment = "この商品を試してみました。#{['とても良かった', '満足している', '期待通りでした', '想像以上でした'][rand(4)]}です。また参加したいと思います。"
  end
end

puts "Sample data created successfully!"
puts "Admin: admin@obebibo.com / password"
puts "Users: user1@example.com ~ user5@example.com / password"